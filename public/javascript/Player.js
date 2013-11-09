
Player = function (game, x, y, type, own) {
	
	Phaser.Sprite.call(this, game, x, y, type);
	this.type = type;
	this.x = x;
	this.y = y;
	this.movementSpeed = 600;
	this.jumping = false;
	this.jumpTimer = 0;
	this.body.collideWorldBounds = true;
	this.own = own || false;

	this.body.immovable = !this.own;

	var self = this;

	if (own) {
		self.facing = 1;
		this.body.gravity.y = 50;
	}
	else {
		self.body.allowCollision.left = self.body.allowCollision.right = false;
	}

	switch(type) {
		case "Boogie":
			//new Player(self.game, 520, 300, "Boogie");
			self.animations.add('idle', [0]);
			self.animations.add('right', [0,1,0,2], 8, true);
			self.animations.add('left', [3,4,3,5], 8, true);
			self.animations.play('right');
			break;

		case "PopWalk":
			self.body.width = 80;
			self.body.offset.x = 70;
			self.body.offset.y = 98;
			self.body.height = 100;

			self.body.collideWorldBounds = true;
			self.animations.add('idle', [0]);
			self.animations.add('right', [0,1,0,2], 8, true);
			self.animations.add('left', [3,4,3,5], 8, true);
			self.animations.play('idle');
			break;
	}
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;