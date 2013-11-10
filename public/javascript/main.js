
// candies ///////////////////////////////////////////////////////////////
//	
//	This is the main game class initialising PIXI and handling the game loop
//	@bloomingbridges
//
////////////////////////////////////////////////////////////////////////////////
var COUNT=0;

function other_room(df) {
	var id = candies.levels[candies.levels.indexOf(room_getId()) + df];
	return  document.location.href.split("?")[0] + "?" + id + "?" + candies.players[candies.myId].playerType + "?" + (df>0 ? 0 : 1);
}

function room_firstRun() {
	return  document.location.href.indexOf("?") == -1;
}

function room_getId() {
	return  document.location.href.split("?")[1] || candies.levels[0]	;
}

function room_getChar() {
	return document.location.href.split("?")[2];
}

function room_getSpawnPos() {
	return parseInt(document.location.href.split("?")[3]);
}

//http://192.168.2.64
function room_url() {
	return  '/?roomId=' + room_getId();	
}

function restart(where) {
	if (!candies.restarting) {
		if (where)
			window.location = where;
		else
			window.location.reload();
	}
	candies.restarting = true;
}

var candies = {

	container: {},
	game: {},
	cursors: {},
	markers:[],
	floor: {},
	teleports:{},
	targets:{},
	buttons:{},
	levels: ["escape", "waterkills", "teleport", "combitronics", "cojump", "fires", "party"],

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
	checkEnabled: function(){
		var self=this;
		if(self.enabled){
			for(var i in self.enabled){
				if(self.buttons[i]){
					var marker = self.buttons[i];
					marker.enabled = self.enabled[i];
					marker.animations.play(marker.enabled ? 'on' : 'off')
					if(self.targets[marker.target]){
						var m = self.teleports[marker.target];
						if(m){
							m.enabled = m.enabled ? false:true;
						}
						self.checkTeleports();
					}
				}
				
		    };
			self.enabled=false;
		}
		
	},
	checkTeleports:function(){
		var self = this;
		for(var i in this.teleports){
			var m = this.teleports[i];
			if(!m.emmiter){
				m.emmiter = self.game.particles.add(new Phaser.Particles.Arcade.Emitter(self.game, 20, 20, 50));
				m.emmiter.makeParticles(m.markerName == "teleport" ? "stars":"fire");
				m.emmiter.gravity=m.markerName == "teleport" ? 10:-5;
				m.emmiter.x = m.x;
				m.emmiter.y = m.y;
				m.emmiter.width = m.width;
				m.emmiter.height = 20;
				m.emmiter.minParticleSpeed = new Phaser.Point(-100, -100);
				m.emmiter.setXSpeed(-2, 2);
			}
			if(m.enabled){
				m.emmiter.start(false,2000,null,1000+parseInt(Math.random()*5));
			}else{
				m.emmiter.kill();
			}
		}
	},
	preload: function() {
		var self = this;
		console.log("### PRELOADING..");

		self.game.load.image('TestBackground', 'images/background-' + room_getId() + '.jpg');
		self.game.load.spritesheet('Pop', 'images/PopSprite.png', 195, 200);

		self.game.load.spritesheet('Boogie', 'images/BoogieSprite.png', 100, 150);
		$.ajax({url: "tilemaps/1b.json", dataType: "json"}).done(function(data) {
			//_.where(data.layers, { type:"objectgroup"});
		});

		self.game.load.tilemap('Room', 'tilemaps/' + room_getId() + '.json', null, Phaser.Tilemap.TILED_JSON);
		
		self.game.load.image('waterdrop', 'images/waterdrop.png');
		self.game.load.image('stars', 'images/stars.png');
		self.game.load.image('fire', 'images/flametongue.png');
		self.game.load.spritesheet('Button', 'images/wallswitchanime.png', 64, 100);
		
    	self.game.load.tileset('tiles', 'tilemaps/tileset.png', 64, 64);
    	// self.game.load.audio('music', 'audio/two.mp3');
    	//self.game.load.audio('music', ['audio/Dig_Up_Her_Bones.mp3']);

	},

	create: function() {
		var self = this;
		
		
		
		console.log("### GAME CREATED!");

		$("#loading").hide();
		$("body").addClass("level-" + room_getId());
		
		// self.game.stage.backgroundColor = '#F8CA00';

		self.background = self.game.add.sprite(0, 0, 'TestBackground');

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
		
		if (!room_firstRun())
			self.login();

	},


	login: function() {
		var self = this;

		var socket = self.socket = io.connect(room_url());

		socket.on('whoami', function (id) {
			self.myId = id;
			console.log("i am", self.myId);

			var first = room_firstRun();
			var begg = !room_getSpawnPos();

			var pos = begg ? 100 : (self.tileLayer.width-300);

			var datum = {x: pos , y: first?30:300, type: room_getChar() || _.sample(["Boogie", "Pop"])};

			var player = self.players[id] = new Player(self.game, datum.x, datum.y, datum.type, true);

			self.game.add.existing(player);
			self.game.camera.follow(player);

			player.facing = begg ? Phaser.RIGHT : Phaser.LEFT;
		});
	
		socket.on('heartbeat', function (seq) {
			//handle stuff here
			COUNT = seq;
		});
		
		socket.on('enabled', function (data) {
			//handle stuff here
			console.log(data);
			self.enabled = data;
			$.getJSON('tilemaps/' + room_getId() + '.json',function(data){
				for(var i=0;i!= data.layers.length;i++){
					var dl = data.layers[i];
					if(dl.objects){
						for(var j=0;j!= dl.objects.length;j++){
							var ttt = dl.objects[j];
							var a = ttt.name.split("#");
							var m = new Marker(self.game,ttt.x,ttt.y,ttt.width,ttt.height,a[0],a[1],a[0].match("!") ? false:true);
							self.markers.push(m);
							a[0] = a[0].replace("!","");
							if(a[0] == "teleport" || a[0] == "fire"){
								self.teleports[a[1]] = m;
							}
							if(a[0] == "target" && a[1]){
								self.targets[a[1]] = m;
							}
							if(a[0] == "button" && a[1]){
								self.buttons[a[1]] = m;
							}
						}
					}
				}
				self.checkEnabled();
				self.checkTeleports();
		
			})
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
				Behaviors[data.name](self,data.marker,player);
		    }
		});
	},

	update: function() {

		var self = this;
		self.background.x = Math.max(0,self.game.camera.x/2);
		
		var jump_button = (self.jumpButton.isDown || self.cursors.up.isDown);

		if (!self.socket && jump_button)
			self.login();

		// Handling Player Movement ////////////////////////////////////////////

		var player = self.players[self.myId];

		if (player) {

			if (player.dead) {
				player.body.velocity.x = 0;
				if ((player.body.bottom - candies.tileLayer.height) > player.height*1.2 ) {
					restart();
				}
			}
			else {

				self.game.physics.collide(player, self.tileLayer);

				if (self.restarting)
					return;

				_.each(self.players, function(v) {
					if (player != v) {
						self.game.physics.collide(v, player);
					}
				});
				
				_.each(self.markers, function(v) {
					self.game.physics.collide(v, player,function(){
						player.body.touching.down=false;
						var a = v.markerName.split("#");
						if(Behaviors[v.markerName]){
							Behaviors[v.markerName](self,v,player);
							self.socket.emit("behavior",{name:a[0],id:self.myId,marker:{x:v.x,y:v.y,width:v.width,height:v.height}});
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

				if (jump_button && player.body.touching.down ) {
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
	candies.preinit($("#stageContainer"));
	$(window).on('keyup', function(event) {
		// console.log(event.keyCode);
		if (event.keyCode == 32) {
			console.log("PAUSED?");
		}
	});
}); 

