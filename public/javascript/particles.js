	window.particleSplash = function(x,y){
		var splashEmmiter = CandyConvicts.game.particles.add(new Phaser.Particles.Arcade.Emitter(CandyConvicts.game, 20, 20, 50));
		splashEmmiter.makeParticles("waterdrop");
		splashEmmiter.gravity=20;
		splashEmmiter.x = x+75;
		splashEmmiter.y = y+100;
		splashEmmiter.width = 100;
		splashEmmiter.height = 50;
		splashEmmiter.minParticleSpeed = new Phaser.Point(-400, -400);
		splashEmmiter.setXSpeed(-2, 2);
		splashEmmiter.start(true,3000,null,20+parseInt(Math.random()*10));
	}


	window.particleStars = function(x,y){
		var splashEmmiter = CandyConvicts.game.particles.add(new Phaser.Particles.Arcade.Emitter(CandyConvicts.game, 20, 20, 50));
		splashEmmiter.makeParticles("stars");
		splashEmmiter.gravity=10;
		splashEmmiter.x = x+25;
		splashEmmiter.y = y+100;
		splashEmmiter.width = 100;
		splashEmmiter.height = 50;
		//splashEmmiter.minParticleSpeed = new Phaser.Point(-100, -200);
		splashEmmiter.setXSpeed(-5, 5);
		splashEmmiter.start(true,800,null,5+parseInt(Math.random()*5));
		return splashEmmiter;
	}
