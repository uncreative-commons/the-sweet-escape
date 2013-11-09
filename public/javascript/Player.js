Behaviors = {
	"water": function(game,marker,player){
		particleSplash(player.x+50,player.y+100);
		player.dead = true;
	},
	"next#1": function(game,marker,player){
		console.log("OMG WATER!!! NOOOOOOOOOOOOOOOOO")
	}
}

Marker = function (game, x, y, width,height,name){
	Phaser.Sprite.call(this, game, x, y,"Boogie");
	this.markerName = name;
	this.body.x = x;
	this.body.y = y;
	this.body.customSeparateX = true;
	this.body.customSeparateY = true;
	this.body.width = width;
	this.body.height = height;
	this.body.collideWorldBounds = false;
	this.body.immovable = true;
	
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

		case "Pop":
			self.body.width = 80;
			self.body.offset.x = 70;
			self.body.offset.y = 98;
			self.body.height = 100;

			self.body.collideWorldBounds = true;
			self.animations.add('idle_right', [1]);
			self.animations.add('idle_left', [4]);

			self.animations.add('right', [0,1,0,2], 8, true);
			self.animations.add('left', [3,4,3,5], 8, true);
			break;
	}
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
