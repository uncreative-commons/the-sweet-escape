
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

		self.game.load.spritesheet('PopWalk', 'images/PopWalkSprite.png', 200, 200);
		self.game.load.spritesheet('Boogie', 'images/BoogieSprite.png', 125, 200);
		self.game.load.tilemap('Room0', 'tilemaps/0.json', null, Phaser.Tilemap.TILED_JSON);
    	self.game.load.tileset('tiles', 'tilemaps/tileset.png', 64, 64);

	},

	create: function() {

		var self = this;
		console.log("### GAME CREATED!");

		// self.game.stage.backgroundColor = '#F8CA00';
		self.currentRoom = self.game.add.tilemap('Room0');
		self.tileset = self.game.add.tileset('tiles');
		self.tileset.setCollisionRange(1, 3, true, true, true, true);
		self.tileLayer = self.game.add.tilemapLayer(0, 0, self.currentRoom.layers[0].width*self.tileset.tileWidth, self.currentRoom.layers[0].height*self.tileset.tileWidth, self.tileset, self.currentRoom, 0);
		self.tileLayer.fixedToCamera = false;
		self.tileLayer.resizeWorld();

		self.player = self.game.add.sprite(0, 0, 'PopWalk');
		self.player.x = 250;
		self.player.y = 50;
		self.player.facing = 1;
		self.player.body.width = 80;
		self.player.body.offset.x = 70;
		self.player.body.offset.y = 100;
		self.player.body.height = 100;
		self.player.body.gravity.y = 200;
		self.player.body.collideWorldBounds = true;
		self.player.animations.add('idle', [0]);
		self.player.animations.add('right', [0,1,0,2], 8, true);
		self.player.animations.add('left', [3,4,3,5], 8, true);
		self.player.animations.play('idle');

		var boogie = new Player(self.game, 520, 300, "Boogie");
		boogie.animations.add('idle', [0]);
		boogie.animations.add('right', [0,1,0,2], 8, true);
		boogie.animations.add('left', [3,4,3,5], 8, true);
		boogie.animations.play('right');
		boogie.body.allowCollision.left = boogie.body.allowCollision.right = false;
		self.game.add.existing(boogie);

		self.players = [boogie];

		self.game.camera.follow(self.player);
		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.X);

	},

	update: function() {
		
		var self = this;
		// console.log("### UPDATING..");


		// Handling Player Movement ////////////////////////////////////////////

		self.game.physics.collide(self.player, self.tileLayer);

		for (p in self.players) {
			self.game.physics.collide(self.players[p], self.tileLayer);
			self.game.physics.collide(self.players[p], self.player);
		}

		if (self.cursors.right.isDown || self.cursors.left.isDown) {
			self.player.facing = (self.cursors.left.isDown) ? Phaser.LEFT : Phaser.RIGHT;
			self.player.body.velocity.x = (self.player.facing == Phaser.LEFT) ? -500 : 500;
			self.player.animations.play((self.player.facing == Phaser.RIGHT) ? 'right' : 'left');
		} else {
			self.player.body.velocity.x = 0;
			self.player.frame = (self.player.facing == Phaser.LEFT) ? 4 : 0;
		}

		if (self.jumpButton.isDown) {
			self.player.body.velocity.y = -300;
		}

	},

	render: function() {

		var self = this;
		console.log("### RENDERING..");

		self.game.debug.renderCameraInfo(self.game.camera, 32, 64);
		// self.game.debug.renderRectangle(self.player.body);

	}

}


//	This is the main entry point for the game

Zepto(function($) {
	CandyConvicts.init($("#stageContainer"));
	$(window).on('keyup', function(event) {
		if (event.keyCode == 32) {
			console.log("PAUSED?");
		}
	});
}); 

