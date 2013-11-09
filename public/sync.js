var hasEventSource = !!window.EventSource;

$.couch.urlPrefix = "http://192.168.2.6:5984";

if (!hasEventSource)
	alert("Needs event source");

/*
var es = new EventSource($.couch.urlPrefix + "/level/_changes?feed=eventsource&since=now");

es.addEventListener('message', function(e) {
	
	var data = JSON.parse(e.data);

	var sel = '[data-uid="' + data.id + '"]';

	if (data.deleted) {
		$( sel ).remove();
	} else {
		if ($( sel ).length == 0) {
			$( "#layers" ).append(createMenu({_id: data.id, title: "loading ..."}));
		}
		cdbGet("level", data.id).done(function(data) {
			var $el = $( sel );
			
			$el.find(".label").text(data.title);
			$el.attr("data-rev", data._rev);
		})
	}

	console.log(data);
}, false);
*/

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
	var uid = cuid(type);
	var rv = cq(where + "/" + uid, obj, "PUT");
	rv.uid = uid;
	return rv;
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


function watcher(cfg) {
	_.defaults(this, { 
		items: {},
	});

	_.extend(this, cfg);
	
	var that = this;
	
	var es = new EventSource($.couch.urlPrefix + "/" + that.endpoint + "/_changes?feed=eventsource&since=now");

	es.addEventListener('message', function(e) {
		
		var data = JSON.parse(e.data);
		var id = data.id;
		
		var item = that.items[id];
		
		var evt =	(!item && !data.deleted) ? "create" :
					(item && !data.deleted) ? "update_notify" :
					(item && data.deleted) ? "destroy" : null;

		that.process_message(evt, data, item, id);
					
		console.log(data);
	}, false);

	cdbList("level").done(function(data) {
		_.each(data, function(v, k) {
			cdbGet("level", v.id).done(function(data) {
				that.process_message("create", data, data, data._id);
			});
		});
	});

}

watcher.prototype.message = function(evt, data) {
	var fn = this[evt];

	if (typeof fn == "function") {
		fn.call(this, this.getEntity(data), data);
	}
}

watcher.prototype.process_message = function(evt, data, item, id) {
	if (evt) {
		if (evt == "create")
			item = this.items[id] = {_id : id}
		
		if (evt == "destroy")
			delete this.items[id];
		else {
			var that = this;
			cdbGet(this.endpoint, id).done(function(data) {
				var item = that.items[id];
				
				if (item)
					that.message("update", _.extend(item, data));
			});
		}
		
		this.message(evt, item);
	}
}

watcher.prototype.objRevId = function (obj) {
	return obj._id + "?rev=" + obj._rev;
}

watcher.prototype.remoteAdd = function(data) {
	var uid = cuid(this.endpoint);
	cdbSet(this.endpoint, uid, data);
	return uid;
}

watcher.prototype.remoteSet = function(data) {

	var x = _.clone(data);
	var reject = _.filter(_.keys(x), function(n) { n[0] == "_" });
	for (var i = 0; i<reject.length; i++)
		delete x[i]

	cdbSet(this.endpoint, this.objRevId(data), x);	
}

watcher.prototype.remoteChange = function(data, newdata) {
	if (!data._id)
		data = this.items[data];

	return this.remoteSet(_.extend(_.clone(data), newdata))
}

watcher.prototype.remoteDelete = function(data) {
	if (!data._id)
		data = this.items[data];

	cdbDelete(this.endpoint, this.objRevId(data));
}