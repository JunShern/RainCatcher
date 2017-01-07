
var particles = []; 
var numParticles = 20;

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (var i=0; i<numParticles; i++) {
    	particles.push(new Particle(i));
    }
    indexCount = numParticles;
}

function draw() {
    background(0,50);

    fill(255);
    noStroke();
    for (var i=0; i<numParticles; i++) {
    	particles[i].display();
    	particles[i].fall();
    	particles[i].melt();
    }
}

function Particle(index) {
	this.x = random(width);
	this.y = random(height)-height;
	this.index = index;
	this.diameter = random(10, 30);

	this.display = function() {
		ellipse(this.x, this.y, this.diameter, this.diameter);
	}

	this.fall = function() {
		this.y = constrain(this.y+1, -height, height-this.diameter/2);
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
}


