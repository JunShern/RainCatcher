
var particles = []; 
var numParticles = 50;

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (var i=0; i<numParticles; i++) {
    	particles.push(new Particle(i));
    }
    indexCount = numParticles;
}

function draw() {
    background(0,40);

    noStroke();
    for (var i=0; i<numParticles; i++) {
    	if (particles[i].hasChildren) {
    		particles[i].handleChildren();
    	} else {
    		particles[i].display();
	    	particles[i].fall();
	    	particles[i].melt();
    	}
    }
}

function Particle(index) {
	this.x = random(width);
	this.y = random(2*height)-2*height;
	this.index = index;
	this.diameter = random(2, 10);
	this.c = random(150,255);
	this.children = [];
	this.hasChildren = false;
	this.numChildren = this.diameter;

	this.display = function() {
		fill(this.c);
		ellipse(this.x, this.y, this.diameter, this.diameter);
	}

	this.fall = function() {
		this.y = constrain(this.y+2, -2*height, height-this.diameter/2);
	}

	this.melt = function() {
		// if (this.y == height-this.diameter/2 && random(100)>90) {
		// 	this.diameter = this.diameter-1;
		// }

		var catchSize = 20;
		if (abs(this.y-mouseY)<catchSize && abs(this.x-mouseX)<catchSize) {
			this.explode();
			this.hasChildren = true;
		} else if (this.y == height-this.diameter/2) {
			this.explode();
			this.hasChildren = true;
			// Reset particle
			//particles[this.index] = new Particle(this.index);
		}

	}

	this.explode = function() {
		console.log("A FireChild is born!");
		for (var i=0; i<this.numChildren; i++) {
			this.children[i] = new FireChild(i, this.x, this.y);
		}
	}

	this.handleChildren = function() {
		// Check if children have all moved off screen
		var noMoreChildren = true;
		for (var i=0; i<this.numChildren; i++) {
			if (this.children[i].y < height+this.children[i].diameter/2) {
				noMoreChildren = false;
			}
		}
		if (noMoreChildren) {
			// Reset particle
			particles[this.index] = new Particle(this.index);
		} else {
			// Move and show children
			for (var i=0; i<this.numChildren; i++) {
				this.children[i].move();
				this.children[i].display();
			}	
		}
		
	}
}

function FireChild(index, xpos, ypos) {
	this.x = xpos;
	this.y = ypos;
	this.velX = random(-5,5);
	this.velY = random(0,-5);
	this.diameter = random(1,2);
	this.c = 255; //color(random(200,255), random(150,200), random(0,50));

	this.display = function() {
		fill(this.c);
		ellipse(this.x, this.y, this.diameter, this.diameter);
	}

	this.move = function() {
		this.x = this.x + this.velX;
		this.y = this.y + this.velY;
		this.x = this.x - (this.x/abs(this.x));
		this.velY = this.velY + 1;
	}

}

