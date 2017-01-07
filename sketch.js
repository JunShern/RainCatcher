
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
    	particles[i].display();
    	particles[i].fall();
    	particles[i].melt();
    }
}

function Particle(index) {
	this.x = random(width);
	this.y = random(2*height)-2*height;
	this.index = index;
	this.diameter = random(2, 10);
	this.c = random(150,255);
	this.children = [];
	this.numChildren = 5;

	this.display = function() {
		fill(this.c);
		ellipse(this.x, this.y, this.diameter, this.diameter);
	}

	this.fall = function() {
		this.y = constrain(this.y+1, -2*height, height-this.diameter/2);
	}

	this.melt = function() {
		if (this.y == height-this.diameter/2 && random(100)>90) {
			this.diameter = this.diameter-1;
		}
		if (this.diameter <= 0) {
			// Reset particle
			particles[this.index] = new Particle(this.index);
		}
	}

	this.explode = function() {
		for (var i=0; i<this.numChildren; i++) {
			this.children[i] = new Particle(i);
		}
	}

}


