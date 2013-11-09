
// CandyConvicts ///////////////////////////////////////////////////////////////
//	
//	This is the main game class initialising PIXI and handling the game loop
//	@bloomingbridges
//
////////////////////////////////////////////////////////////////////////////////

var room_id = 'http://192.168.2.6/?roomId=3';

var CandyConvicts = {

	container: {},
	game: {},
	player: {},
	cursors: {},

	floor: {},

	init: function(container) {

		var self = this;

		self.container = container;
		self.game = new Phaser.Game(
			container.width(), 
			container.height(),
			Phaser.CANVAS,
			'Candy Convicts',
			{
				preload: self.preload,
				create:  self.create,
				update:  self.update,
				render:  self.render
			}
		);

	},

	preload: function() {

		var self = this;
		console.log("### PRELOADING..");

		self.game.load.image('TestBackground', 'tilemaps/background.jpg');
		self.game.load.spritesheet('PopWalk', 'images/PopWalkSprite.png', 200, 200);
		self.game.load.spritesheet('Boogie', 'images/BoogieSprite2.png', 132, 200);
		self.game.load.tilemap('Room0', 'tilemaps/0.json', null, Phaser.Tilemap.TILED_JSON);
		self.game.load.tilemap('Room1', 'tilemaps/1.json', null, Phaser.Tilemap.TILED_JSON);
		self.game.load.tilemap('Room2', 'tilemaps/2.json', null, Phaser.Tilemap.TILED_JSON);
    	self.game.load.tileset('tiles', 'tilemaps/tileset.png', 64, 64);

	},

	create: function() {

		var self = this;
		console.log("### GAME CREATED!");

		// self.game.stage.backgroundColor = '#F8CA00';

		var background = self.game.add.sprite(0, 0, 'TestBackground');

		self.currentRoom = self.game.add.tilemap('Room2');
		self.tileset = self.game.add.tileset('tiles');
		self.tileset.setCollisionRange(1, 6, true, true, true, true);
		self.tileLayer = self.game.add.tilemapLayer(0, 0, self.currentRoom.layers[0].width*self.tileset.tileWidth, self.currentRoom.layers[0].height*self.tileset.tileWidth, self.tileset, self.currentRoom, 0);
		self.tileLayer.fixedToCamera = false;
		self.tileLayer.resizeWorld();


		/*
		self.player = new Player(self.game, 250, 50, "PopWalk", true);
		self.game.add.existing(self.player);
		*/

/*
		var boogie = new Player(self.game, 520, 300, "Boogie");
		self.game.add.existing(boogie);
		*/

		//self.players = [boogie];

		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.X);

		self.players={};

		var socket = self.socket = io.connect(room_id);

		socket.on('whoami', function (id) {
			self.myId = id;
			console.log("i am", self.myId);

			var datum = {x: 250, y: 20, type: _.sample(["Boogie", "PopWalk"])};
			socket.emit("change", datum);

			var player = self.players[id] = new Player(self.game, datum.x, datum.y, datum.type, true);
			self.game.add.existing(player);
			self.game.camera.follow(player);
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
	      		console.log(id, datum.x, datum.y, datum.animation);
			}
		});

		socket.on('remove', function (id) {
			var player = self.players[id];
			if (player) {
		        	//self.game.remove(player)
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
		
	},

	update: function() {
		
		var self = this;
		// console.log("### UPDATING..");


		// Handling Player Movement ////////////////////////////////////////////

		var player = self.players[self.myId];

		if (player) {
			self.game.physics.collide(player, self.tileLayer);

			_.each(self.players, function(v) {
				if (player != v) {
					//self.game.physics.collide(v, self.tileLayer);
					self.game.physics.collide(v, player);
				}
			});

			if (self.cursors.right.isDown || self.cursors.left.isDown) {
				player.facing = (self.cursors.left.isDown) ? Phaser.LEFT : Phaser.RIGHT;
				player.body.velocity.x = (player.facing == Phaser.LEFT) ? -player.movementSpeed : player.movementSpeed;
				player.animations.play((player.facing == Phaser.RIGHT) ? 'right' : 'left');
			} else {
				player.body.velocity.x = 0;
				player.frame = (player.facing == Phaser.LEFT) ? 4 : 0;
			}

			if (self.jumpButton.isDown && player.body.touching.down && !player.jumping) {
				player.jumping = true;
			} 

			if (player.jumping) {
				player.body.velocity.x = (player.facing == Phaser.LEFT) ? -500 : 500;
				player.body.velocity.y = -1000;
				player.jumpTimer += 1;
				if (player.jumpTimer >= 8) {
					player.jumping = false;
					player.body.velocity.x = 0;
					player.body.velocity.y = 0;
					player.jumpTimer = 0;
				}

			}

			//self.playersSync.remoteChange(self.myId, {x: player.x | 0, y: player.y | 0, animation: player.animations.currentAnim.name})
			var datum = {x: player.x | 0, y: player.y | 0, animation: player.animations.currentAnim.name, type: player.type};
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
	CandyConvicts.init($("#stageContainer"));
	$(window).on('keyup', function(event) {
		// console.log(event.keyCode);
		if (event.keyCode == 32) {
			console.log("PAUSED?");
		}
	});
}); 

