
var particles = []; 
var numParticles = 50;
var catchSize = 20;
var prevMouseX;
var prevMouseY;
var state = 0;

var score = 0;
var scoreBrightness = 255;

var waterLevel = 10;
var waterThreshold = 200;
var frameCounter = 0;

var pentatonicScale = [0, 2, 4, 7, 9, 12];
var octave = 6;
var osc;

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

    // Triangle oscillator
    osc = new p5.TriOsc();
    osc.start();
    osc.amp(0);
}

function draw() {
    background(0,40);
    //drawThreshold();
    drawWater();
    /* State handling
	State 0 - Welcome screen
	State 1 - Playing game
	State 2 - Paused
	State 3 - Game Over
	*/
	if (state == 0) {
		introScreen();
		handleParticles();
	} else if (state == 1) {
		runGame();
		handleParticles();
	} else if (state == 2) {
		paused();
	} else if (state == 3) {
		gameOver();
	} 

	frameCounter++;
	//drawMoon();
}

function playNote(note, duration) {
  osc.freq(midiToFreq(note));
  // Fade it in
  osc.fade(0.5,0.2);

  // If we sest a duration, fade it out
  if (duration) {
    setTimeout(function() {
      osc.fade(0,0.2);
    }, duration-50);
  }
}

function drawThreshold() {
	stroke(200,100,30);
	strokeWeight(2);
	line(width/2, height-waterThreshold, width/2, height);
	noStroke();
}

function gameOver() {
	cursor(); // In-built function to show standard cursor
	displayScore();
	textSize(16);
	textFont("Verdana");
	text("Game over!\nRefresh page to play again.", width/2, height/2+50);
	if (keyIsDown(ENTER) === true) {
		state = 1;
	}
}

function drawMoon() {
	colorMode(HSB,100);
	c = color(random(15,25), 30, random(80,100)); //random(200,255), random(150,200), random(0,50));
	stroke(c);
	colorMode(RGB,255);
	strokeWeight(1);
	noFill();

	var jitter = 10;
	var vertices = 10;
	var radius = 50;
	var centerX = width*2/3;
	var centerY = height/3;
	beginShape();
	var startAngle = random(TWO_PI);
	for (var i=0; i<vertices; i++) {
		var radians = i*TWO_PI / float(vertices);
		var x = centerX + radius*cos(startAngle+radians) + random(-jitter, jitter);
		var y = centerY + radius*sin(startAngle+radians) + random(-jitter, jitter);
		vertex(x,y);
	}
	endShape(CLOSE);

	noStroke();
}

function drawWater() {
	var lineGap = 15;
	var waveHeight = 30;
	for (var i=0; i*lineGap<height; i++) {
		var frameOsc = cos(frameCounter*TWO_PI/200.0);
		var lineOsc = sin(i*TWO_PI/25.0);

		// Draw water level	
		colorMode(HSB,100);
		strokeWeight(1);
		stroke(50 + lineOsc*10 - frameOsc*10, 70, 80, 50); //random(200,255), random(150,200), random(0,50));
		colorMode(RGB,255);
		var numJoints = random(5,20);
		for (var j=0; j<numJoints; j++) {
			var x1 = j*width/numJoints;
			var y1 = height-waterLevel+(i*lineGap) + (j%2)*10;
			var x2 = (j+1)*width/numJoints;
			var y2 = height-waterLevel+(i*lineGap) + ((j+1)%2)*5;
			line(x1, y1, x2, y2);
		}
		noStroke();
	}
}

function handleParticles() {
	noStroke();
    for (var i=0; i<numParticles; i++) {
    	if (particles[i].hasChildren) {
    		particles[i].handleChildren();
    	} else {
    		particles[i].display();
	    	particles[i].fall();
	    	particles[i].checkMouse();
	    	//particles[i].melt();
    	}
    }
}

function displayScore() {
	scoreBrightness = constrain(scoreBrightness-1, 230, 255);
	fill(scoreBrightness,100);

	textAlign(CENTER);
	textSize(scoreBrightness*100/255);
	textFont("Arial");
	text(score, width/2, height/2);
}

function paused() {
	cursor(); // In-built function to show standard cursor
	displayScore();
	for (var i=0; i<numParticles; i++) {
		particles[i].display();
	}
	fill(255);
	textSize(16);
	textFont("Verdana");
	text("Game paused.\nPress ENTER to resume.", width/2, height/2+50);
	if (keyIsDown(ENTER) === true) {
		state = 1;
	}
}

function runGame() {
	drawCursor();
	displayScore();
	if (keyIsDown(32) === true) {
		state = 2;
	}
}

function drawTitle() {
	cursor(); // In-built function to show standard cursor
	fill(255);
	textAlign(CENTER);
	textSize(56);
	textFont(titleFont);
	text("RainCatcher", width/2, height/2);
}

function introScreen() {
	drawTitle();
	textSize(16);
	textFont("Verdana");
	text("Use the cursor to catch raindrops.\nPress ENTER to begin.", width/2, height/2+50);
	if (keyIsDown(ENTER) === true) {
		state = 1;
	}
}

function drawCursor() {
	noCursor(); // In-built function to hide cursor
	fill(100,255,255);
    strokeWeight(2);
    stroke(100,255,255);
    line(mouseX, mouseY, prevMouseX, prevMouseY);
    noStroke();
    ellipse(mouseX, mouseY, catchSize/4, catchSize/4);
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function Particle(index) {
	this.x = random(width);
	this.y = random(2*height)-2*height;
	this.index = index;
	this.diameter = random(2, 10);
	
	colorMode(HSB,100);
	this.c = color(random(50,60), 50, random(80,100)); //random(200,255), random(150,200), random(0,50));
	colorMode(RGB,255);

	this.children = [];
	this.hasChildren = false;
	this.numChildren = this.diameter;

	this.display = function() {
		fill(this.c);
		ellipse(this.x, this.y, this.diameter, this.diameter);
	}

	this.fall = function() {
		if (this.y >= height-this.diameter/2-waterLevel) {
			this.melt();
		} else {
			this.y = constrain(this.y+2, -2*height, height-waterLevel);
		}
	}

	this.melt = function() {
		if (random(100)>60) this.y = this.y + 1;
		if (random(100)>90) {
			this.diameter = this.diameter-1;
			if (state === 1) {
				waterLevel = waterLevel+0.1;
				if (waterLevel > waterThreshold) {
					state = 3;
				}
			}
			if (this.diameter <= 0) {
				// Reset particle
				particles[this.index] = new Particle(this.index);
			}
		}
	}

	this.checkMouse = function() {
		if (abs(this.y-mouseY)<catchSize && abs(this.x-mouseX)<catchSize) {
			this.explode();
			this.hasChildren = true;
		} 
	}

	this.explode = function() {
		note = 12*octave + pentatonicScale[int(random(0,pentatonicScale.length))];
		//playNote(note, 300);
		//console.log("A FireChild is born!");
		for (var i=0; i<this.numChildren; i++) {
			if (state === 1) { 
				score = score + 1;
				scoreBrightness = constrain(scoreBrightness+10, 200, 255);
			}
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
	this.c = 255; //random(200,255), random(150,200), random(0,50));

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

