
var particles = []; 
var numParticles = 50;
var catchSize = 20;
var prevMouseX;
var prevMouseY;
var state = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    prevMouseX = width/2;
    prevMouseY = height/2;

    for (var i=0; i<numParticles; i++) {
    	particles.push(new Particle(i));
    }
    indexCount = numParticles;

    // Font setup
    titleFont = "Georgia";
    //titleFont = loadFont("assets/fonts/ArimaMadurai-Regular.ttf");
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
	    	particles[i].checkMouse();
	    	particles[i].melt();
    	}
    }


    /* State handling
	State 0 - Welcome screen
	State 1 - Playing game
	State 2 - Paused
	*/
	if (state == 0) {
		introScreen();
	} else {
		runGame();
	}
}

function paused() {
	drawTitle();
}

function runGame() {
	drawCursor();
}

function drawTitle() {
	fill(255);
	textAlign(CENTER);
	textSize(56);
	textFont(titleFont);
	text("RainCatcher", width/2, height/2);
}

function introScreen() {
	drawTitle();
	textSize(16);
	textFont("Georgia");
	text("Use the cursor to catch raindrops.\nPress any key to begin.", width/2, height/2+50);
	if (keyIsPressed === true) {
		state = 1;
	}
}

function drawCursor() {
	fill(100,255,255);
    strokeWeight(2);
    stroke(100,255,255)
    line(mouseX, mouseY, prevMouseX, prevMouseY);
    noStroke();
    ellipse(mouseX, mouseY, catchSize/2, catchSize/2);
    prevMouseX = mouseX;
    prevMouseY = mouseY;
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

	this.checkMouse = function() {
		if (abs(this.y-mouseY)<catchSize && abs(this.x-mouseX)<catchSize) {
			this.explode();
			this.hasChildren = true;
		} 
	}

	this.melt = function() {
		if (this.y >= height-this.diameter/2 && random(100)>90) {
			this.diameter = this.diameter-1;
			if (this.diameter <= 0) {
				// Reset particle
				particles[this.index] = new Particle(this.index);
			}
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

