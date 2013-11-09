
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
			Phaser.AUTO,
			'Candy Convicts',
			{
				preload: self.preload,
				create:  self.create,
				update:  self.update
			}
		);

	},

	preload: function() {

		var self = this;
		console.log("### PRELOADING..");

		self.game.load.spritesheet('PopWalkRight', 'images/PopWalkRightSprite.png', 200, 200);

	},

	create: function() {

		var self = this;
		console.log("### GAME CREATED!");

		self.game.stage.backgroundColor = '#F8CA00';

		self.player = self.game.add.sprite(0, 0, 'PopWalkRight');
		self.player.y = 100;
		self.player.animations.add('idle', [0]);
		self.player.animations.add('right', [0,1,0,2], 8, true);
		self.player.animations.play('idle');

		var secondPop = new Player(self.game, 0, 300, "PopWalkRight");
		secondPop.animations.play('right');
		self.game.add.existing(secondPop);

		self.game.camera.follow(self.player);
		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.X);

	},

	update: function() {
		
		var self = this;
		// console.log("### UPDATING..");

		// Handling Player Movement ////////////////////////////////////////////

		if (self.cursors.right.isDown || self.cursors.left.isDown) {
			self.player.body.velocity.x = (self.cursors.right.isDown) ? 150 : -150;
			self.player.animations.play('right');
		} else {
			self.player.body.velocity.x = 0;
			self.player.animations.play('idle');
		}

		if (self.jumpButton.isDown) {
			self.player.body.velocity.y = -300;
		}

	},

	render: function() {

		var self = this;
		console.log("### RENDERING..");

	}

}


//	This is the main entry point for the game

Zepto(function($) {
	CandyConvicts.init($("#stageContainer"));
}); 

