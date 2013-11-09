
// CandyConvicts ///////////////////////////////////////////////////////////////
//	
//	This is the main game class initialising PIXI and handling the game loop
//	@bloomingbridges
//
////////////////////////////////////////////////////////////////////////////////

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


		self.player = new Player(self.game, 250, 50, "PopWalk", true);
		self.game.add.existing(self.player);

/*
		var boogie = new Player(self.game, 520, 300, "Boogie");
		self.game.add.existing(boogie);
		*/

		//self.players = [boogie];

		self.game.camera.follow(self.player);
		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.X);

		self.players={};
		self.playersSync = new watcher({
		      endpoint: "arena",

		      getEntity: function (data) {
		      	return self.players[data._id];
		        //return $('[data-uid="' + data._id + '"]');
		      },
		      create: function(player, data) {
		      	if (player)
		        	this.destroy(player, data);
		      },
		      
		      update: function(player, data) {
		      	if (!player) {
		      		player = self.players[data._id] = new Player(self.game, data.x, data.y, "Boogie")
					self.game.add.existing(player);
		      	}

		      	player.x = data.x;
		      	player.y = data.y;
		      },

		      destroy: function(player, data) {
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
		      }

		});
	},

	update: function() {
		
		var self = this;
		// console.log("### UPDATING..");


		// Handling Player Movement ////////////////////////////////////////////

		self.game.physics.collide(self.player, self.tileLayer);

		_.each(self.players, function(v) {
			self.game.physics.collide(v, self.tileLayer);
			self.game.physics.collide(v, self.player);
		});

		if (self.cursors.right.isDown || self.cursors.left.isDown) {
			self.player.facing = (self.cursors.left.isDown) ? Phaser.LEFT : Phaser.RIGHT;
			self.player.body.velocity.x = (self.player.facing == Phaser.LEFT) ? -self.player.movementSpeed : self.player.movementSpeed;
			self.player.animations.play((self.player.facing == Phaser.RIGHT) ? 'right' : 'left');
		} else {
			self.player.body.velocity.x = 0;
			self.player.frame = (self.player.facing == Phaser.LEFT) ? 4 : 0;
		}

		if (self.jumpButton.isDown && self.player.body.touching.down && !self.player.jumping) {
			self.player.jumping = true;
		} 

		if (self.player.jumping) {
			self.player.body.velocity.x = (self.player.facing == Phaser.LEFT) ? -500 : 500;
			self.player.body.velocity.y = -1000;
			self.player.jumpTimer += 1;
			if (self.player.jumpTimer >= 8) {
				self.player.jumping = false;
				self.player.body.velocity.x = 0;
				self.player.body.velocity.y = 0;
				self.player.jumpTimer = 0;
			}
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

