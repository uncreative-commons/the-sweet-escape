
Player = function (game, x, y, type) {
	
	Phaser.Sprite.call(this, game, x, y, type);

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
