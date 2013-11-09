
Player = function (game, x, y, type) {
	
	Phaser.Sprite.call(this, game, x, y, type);
	this.x = x;
	this.y = y;
	this.body.gravity.y = 200;
	this.body.collideWorldBounds = true;

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
