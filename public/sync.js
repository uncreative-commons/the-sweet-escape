var hasEventSource = !!window.EventSource;

$.couch.urlPrefix = "http://192.168.2.6:5984";

if (!hasEventSource)
	alert("Needs event source");

var es = new EventSource($.couch.urlPrefix + "/level/_changes?feed=eventsource");

es.addEventListener('message', function(e) {
	
	var data = JSON.parse(e.data);

	var sel = '[data-uid="' + data.id + '"]';

	if (data.deleted) {
		$( sel ).remove();
	} else {
		cdbGet("level", data.id).done(function(data) {
			$( sel ).find(".label").text(data.title);
		})
	}

	console.log(data);
}, false);


function cq(path) {
	return $.ajax({
		url: $.couch.urlPrefix + "/" + path,

	})
}

function cuid(type) {
	var uid = Math.random()*(0xFFFFFFFFFFF);

	return ( (type+"_") || "obj_") + uid;
}

function cq( path, postData, action) {
	
	if (!action)
		action = postData ? "POST" : "GET";
	else if (action == "new")
		action = "POST";
	else if (action == "delete")
		action = "DELETE";
	else if (action == "update")
		action = "PUT";
	
	return $.ajax({
	    url: $.couch.urlPrefix  + "/" + path,
	    cache: false,
	    type: action,
	    data: postData?JSON.stringify(postData):undefined,
	    xhrFields: {
	        withCredentials: false
	    },
	    dataType: 'json',
	    contentType: "application/json; charset=utf-8",
	    crossDomain: true,
	})
};


function cdbNew(where, type, obj) {
	return cq(where + "/" + cuid(type), obj, "PUT");
}

function cdbSet(where, uid, obj) {
	return cq(where + "/" + uid, obj, "PUT");
}

function cdbDelete(where, uid) {
	return cq(where + "/" + uid, undefined, "DELETE");
}

function cdbGet(where, uid) {
	return cq(where + "/" + uid);
}

function cdbList(where, type) {
	return cq(where + "/_all_docs").then(function (data) {
        return $.Deferred(function (deferred) {
            deferred.resolve(data.rows);
        }).promise();
    });
}