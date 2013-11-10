Behaviors = {
	"water": function(world,marker,player,arg){
		particleSplash(player.x+50,player.y+100);
		
		if (player.own) {
			player.dead = true;
			player.body.collideWorldBounds = false;
		}
	},
	
	"button": function(world,marker,player,arg){
		if(world.targets[marker.target]){
			var m = world.teleports[marker.target];
			if(m){
				m.enabled = m.enabled ? false:true;
			}
			world.checkTeleports();
		}
	},
	
	"teleport": function(world,marker,player,arg){
		var m = marker;
		if(world.targets[marker.target] && marker.enabled){
			particleStars(player.x,player.y);

			if (player.own) {
				player.x = world.targets[marker.target].x;
				player.y = world.targets[marker.target].y;
			}
		}
	},
	
	"next": function(world,marker,player,arg){
		if (player.own) {
			restart(other_room(1));
		}
	},

	"prev": function(world,marker,player,arg) {
		if (player.own) {
			restart(other_room(-1));
		}
	},

	"overlay": function(world,marker,player,arg) {
		if (player.own) {
			var id = marker.target.split(",");

			var $el = $("#" + id[0]);

			var secs = (id[1] || 10);
			
			$el.show();

			window.setTimeout(function() {
				$el.hide();
			}, secs*1000);
		}
	},
}

Marker = function (game, x, y, width,height,name,target,enabled){
	Phaser.Sprite.call(this, game, x, y,"Boogie");
	this.markerName = name;
	this.target = target;
	this.enabled = enabled;
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
			self.body.offset.x = 18;
			self.body.offset.y = 0;
			self.body.width = 80;
			self.body.height = 150;

			self.animations.add('idle_right', [1]);
			self.animations.add('idle_left', [4]);
			self.animations.add('right', [0,1,0,2], 8, true);
			self.animations.add('left', [3,4,3,5], 8, true);
			self.animations.add('jump_right', [6]);
			self.animations.add('jump_left', [7]);
			break;

		case "Pop":
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

			self.animations.add('jump_right_steady', [7], 1, true);
			self.animations.add('jump_left_steady', [10], 1, true);
			self.animations.add('fall_right', [8]);
			self.animations.add('fall_left', [11]);
			break;
	}
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
