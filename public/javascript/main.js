
// CandyConvicts ///////////////////////////////////////////////////////////////
//	
//	This is the main game class initialising PIXI and handling the game loop
//	@bloomingbridges
//
////////////////////////////////////////////////////////////////////////////////


function room_id() {
	return  parseInt(document.location.href.split("?")[1] || "0");
}

function next_room() {
	return  document.location.href.split("?")[0] + "?" + (room_id() + 1) + "?" + CandyConvicts.players[CandyConvicts.myId].playerType + "?0";
}

function prev_room() {
	return  document.location.href.split("?")[0] + "?" + (room_id() - 1)+ "?" + CandyConvicts.players[CandyConvicts.myId].playerType + "?1";
}

function room_getChar() {
	return document.location.href.split("?")[2];
}

function room_getSpawnPos() {
	return parseInt(document.location.href.split("?")[3]) || 0;
}

//http://192.168.2.64
function room_url() {
	return  '/?roomId=' + room_id();	
}

function restart(where) {
	if (!window.location.asdadasd) {
		if (where)
			window.location = where;
		else
			window.location.reload();
	}
	window.location.asdadasd = true;
	CandyConvicts.restarting = true;
}

var CandyConvicts = {

	container: {},
	game: {},
	player: {},
	cursors: {},
	markers:[],
	floor: {},

	preinit: function(container) {

		var self = this;

		self.container = container;
		self.game = new Phaser.Game(
			container.width(), 
			container.height(),
			Phaser.CANVAS,
			'Candy Convicts',
			self
		);

	},


	preload: function() {
		var self = this;
		$.getJSON('tilemaps/' + room_id() + '.json',function(data){
			for(var i=0;i!= data.layers.length;i++){
				var dl = data.layers[i];
				if(dl.objects){
					for(var j=0;j!= dl.objects.length;j++){
						var ttt = dl.objects[j];
						self.markers.push(new Marker(self.game,ttt.x,ttt.y,ttt.width,ttt.height,ttt.name));
					}
				}
			}
			console.log(self.markers);
		})
		
		console.log("### PRELOADING..");

		self.game.load.image('TestBackground', 'tilemaps/background1.jpg');
		self.game.load.spritesheet('Pop', 'images/PopSprite.png', 195, 200);

		self.game.load.spritesheet('Boogie', 'images/BoogieSprite2.png', 132, 200);
		$.ajax({url: "tilemaps/1b.json", dataType: "json"}).done(function(data) {
			//_.where(data.layers, { type:"objectgroup"});
		});
		self.game.load.tilemap('Room', 'tilemaps/' + room_id() + '.json', null, Phaser.Tilemap.TILED_JSON);
		self.game.load.image('waterdrop', 'images/waterdrop.png');
		self.game.load.image('stars', 'images/stars.png');
		
    	self.game.load.tileset('tiles', 'tilemaps/tileset.png', 64, 64);
    	// self.game.load.audio('music', 'audio/two.mp3');
    	//self.game.load.audio('music', ['audio/Dig_Up_Her_Bones.mp3']);

	},

	create: function() {

		var self = this;

		console.log("### GAME CREATED!");

		$("#loading").remove();
		
		// self.game.stage.backgroundColor = '#F8CA00';

		var background = self.game.add.sprite(0, 0, 'TestBackground');

		self.currentRoom = self.game.add.tilemap('Room');
		self.tileset = self.game.add.tileset('tiles');
		self.tileset.setCollisionRange(1, 6, true, true, true, true);
		self.tileLayer = self.game.add.tilemapLayer(0, 0, self.currentRoom.layers[0].width*self.tileset.tileWidth, self.currentRoom.layers[0].height*self.tileset.tileWidth, self.tileset, self.currentRoom, 0);
		self.tileLayer.fixedToCamera = false;
		self.tileLayer.resizeWorld();

		/*
			self.music = self.game.add.audio('music');
	    	self.music.play();
	    */

		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.X);

		self.players={};

		var socket = self.socket = io.connect(room_url());

		socket.on('whoami', function (id) {
			self.myId = id;
			console.log("i am", self.myId);

			var begg = !room_getSpawnPos();
			var pos = begg ? 100 : (self.tileLayer.width-300);

			var datum = {x: pos , y: 300, type: room_getChar() || _.sample(["Boogie", "Pop"])};

			var player = self.players[id] = new Player(self.game, datum.x, datum.y, datum.type, true);

			self.game.add.existing(player);
			self.game.camera.follow(player);

			player.facing = begg ? Phaser.RIGHT : Phaser.LEFT;
		});

		socket.on('heartbeat', function (seq) {
			//handle stuff here
			
		});
  
		socket.on('state', function (data) {
			
			for(var id in data){
				var datum = data[id];
				if (!_.size(datum))
					continue;

				var player = self.players[id];
				
				if (!player) {
					player = self.players[id] = new Player(self.game, datum.x, datum.y, datum.type, false)
					self.game.add.existing(player);
				}

		
				player.x = datum.x;
		      	player.y = datum.y;
		      	if (player.animations.currentAnim.name != datum.animation)
	      			player.animations.play(datum.animation);
	      		//console.log(id, datum.x, datum.y, datum.animation);
			}
		});

		socket.on('remove', function (id) {
			var player = self.players[id];
			if (player) {
		        	player.kill();

					if (player.group)
					{
					   player.group.remove(player);
					}
					else if (player.parent)
					{
					   player.parent.removeChild(player);
					}
		    }
			console.log("remove", id);
		});
		socket.on('behavior', function (data) {
			var player = self.players[data.id];
			if (player) {
				Behaviors[data.name](self.game,data.marker,player,data.arg);
		    }
		});
		
	},

	update: function() {

		var self = this;

		

		// Handling Player Movement ////////////////////////////////////////////

		var player = self.players[self.myId];

		if (player) {

			if (player.dead) {
				player.body.velocity.x = 0;
				if ((player.body.bottom - CandyConvicts.tileLayer.height) > player.height*1.2 ) {
					restart();
				}
			}
			else {

				self.game.physics.collide(player, self.tileLayer);

				if (self.restarting)
					return;


				if ( (player.x +player.width*1.2) > self.tileLayer.width) {
					restart(next_room());
				}

				if ( room_id() != 0 && (player.x - player.width*0.2 ) < 0) {
					restart(prev_room());
				}

				_.each(self.players, function(v) {
					if (player != v) {
						self.game.physics.collide(v, player);
					}
				});
				
				_.each(self.markers, function(v) {
					self.game.physics.collide(v, player,function(){
						var a = v.markerName.split("#");
						if(Behaviors[v.markerName]){
							Behaviors[a[0]](self.game,v,player,a[1]);
							self.socket.emit("behavior",{name:a[0],id:self.myId,marker:{x:v.x,y:v.y,width:v.width,height:v.height},arg:a[1]});
						}
					});
				});

				if (self.cursors.right.isDown || self.cursors.left.isDown) {
					player.facing = (self.cursors.left.isDown) ? Phaser.LEFT : Phaser.RIGHT;
					player.body.velocity.x = (player.facing == Phaser.LEFT) ? -player.movementSpeed : player.movementSpeed;
					player.animations.play((player.facing == Phaser.RIGHT) ? 'right' : 'left');

					if (!player.body.touching.down && player.body.velocity.y > 0)
						player.animations.play((player.facing == Phaser.RIGHT) ? 'jump_right_steady' : 'jump_left_steady');
				} else {
					player.body.velocity.x = 0;

					if (player.body.touching.down)
						player.animations.play((player.facing == Phaser.RIGHT) ? 'idle_right' : 'idle_left');	
				}

				if ((self.jumpButton.isDown || self.cursors.up.isDown) && player.body.touching.down ) {
					player.body.velocity.y = -500;
					if (player.playerType === "Pop")
						player.animations.play((player.facing == Phaser.RIGHT) ? 'jump_right' : 'jump_left');
				} 
			}

			var datum = {x: player.x | 0, y: player.y | 0, animation: player.animations.currentAnim.name, type: player.playerType};
			if (!_.isEqual(datum, self.old_emit))
				self.socket.emit("change", datum);
			self.old_emit = datum;
		}

	},

	render: function() {

		var self = this;

		// console.log("### RENDERING..");

		// self.game.debug.renderCameraInfo(self.game.camera, 32, 64);
		// self.game.debug.renderRectangle(self.player.body);

	}

}


//	This is the main entry point for the game

$(function($) {
	CandyConvicts.preinit($("#stageContainer"));
	$(window).on('keyup', function(event) {
		// console.log(event.keyCode);
		if (event.keyCode == 32) {
			console.log("PAUSED?");
		}
	});
}); 

