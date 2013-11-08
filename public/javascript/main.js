
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
				create: self.create,
				update: self.update
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

		self.game.stage.backgroundColor = '#dddddd';

		self.player = self.game.add.sprite(0, 0, 'PopWalkRight');
		self.player.y = 100;
		self.player.body.gravity.x = 0.5;
		self.player.animations.add('right', [0,1,0,2], 8, true);
		self.player.animations.play('right');

	},

	update: function() {
		console.log("### UPDATING..");
	}

}


//	This is the main entry point for the game

Zepto(function($) {
	CandyConvicts.init($("#stageContainer"));
}); 

