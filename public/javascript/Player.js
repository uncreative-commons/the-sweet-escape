Marker = function (game, x, y, width,height){
	Phaser.Sprite.call(this, game, x, y,"Boogie");
	this.body.x = x;
	this.body.y = y;
	this.body.width = width;
	this.body.height = height;
	this.body.collideWorldBounds = false;
	this.body.immovable = true;
	this.body.allowCollision.left = this.body.allowCollision.right = this.body.allowCollision.top = this.body.allowCollision.bottom = false;
	
};

Marker.prototype = Object.create(Phaser.Sprite.prototype);
Marker.prototype.constructor = Marker;

Player = function (game, x, y, type, own) {
	
	Phaser.Sprite.call(this, game, x, y, type);
	this.playerType = type;
	this.x = x;
	this.y = y;
	this.movementSpeed = 300;
	this.jumping = false;
	this.jumpTimer = 0;
	this.body.collideWorldBounds = true;
	this.own = own || false;

	this.body.immovable = !this.own;

	var self = this;

	if (own) {
		self.facing = 1;
		this.body.gravity.y = 20;
	}
	else {
		self.body.allowCollision.left = self.body.allowCollision.right = false;
	}

	switch(type) {

		case "Boogie":
			self.animations.add('idle_right', [1]);
			self.animations.add('idle_left', [4]);
			self.animations.add('right', [0,1,0,2], 8, true);
			self.animations.add('left', [3,4,3,5], 8, true);
			break;

		case "PopWalk":
			self.body.width = 80;
			self.body.offset.x = 64;
			self.body.offset.y = 86;
			self.body.height = 100;

			self.body.collideWorldBounds = true;
			self.animations.add('idle_right', [1]);
			self.animations.add('idle_left', [4]);
			self.animations.add('right', [0,1,0,2], 8, true);
			self.animations.add('left', [3,4,3,5], 8, true);
			self.animations.add('jump_right', [7,6], 1, true);
			self.animations.add('jump_left', [10,9], 1, true);
			self.animations.add('fall_right', [8], 1, true);
			self.animations.add('fall_left', [11], 1, true);
			break;
	}
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
