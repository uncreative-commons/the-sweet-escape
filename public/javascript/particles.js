	window.particleSplash = function(x,y){
		var splashEmmiter = CandyConvicts.game.particles.add(new Phaser.Particles.Arcade.Emitter(CandyConvicts.game, 20, 20, 50));
		splashEmmiter.makeParticles("waterdrop");
		splashEmmiter.gravity=3;
		splashEmmiter.x = x+50;
		splashEmmiter.y = y+100;
		splashEmmiter.width = 50;
		splashEmmiter.height = 50;
		
		splashEmmiter.start(true,3000,null,30+parseInt(Math.random()*20));
	}
