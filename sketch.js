
var particles = []; 
var numParticles = 50;
var catchSize = 10;
var state = 0;

var islands = [];
var numIslands = 3;

var moon;

var score = 0;
var scoreBrightness = 255;

var waterLevel = 10;
var waterThreshold = 200;
var frameCounter = 0;

var pentatonicScale = [0, 2, 4, 7, 9, 12];
var octave = 6;
var osc;

var highestPointX;
var highestPointY = 0;

var starPower = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (var i=0; i<numParticles; i++) {
    	particles.push(new Particle(i));
    }
    indexCount = numParticles;

    // Island setup
    for (var i=0; i<numIslands; i++) {
    	var radius = int(random(50,200));
    	islands[i] = new Island(radius);
    	islands[i].create();
    }

    // Moon 
    moon = new Moon(width*2/3, height/3, 30);
    moon.create();

    sorcerer = new Person();

    // Font setup
    //titleFont = "Georgia";
    titleFont = loadFont("assets/fonts/ArimaMadurai-Regular.ttf");

    // Triangle oscillator
    //osc = new p5.TriOsc();
    //osc.start();
    //osc.amp(0);

    // Play/Pause button
    var buttonW = 45;
    var buttonH = 50;
    var padding = 30;
    button = new Button(width-buttonW-padding, padding, buttonW, buttonH);
    frameRate(20);
}

function draw() {
    background(0,70);

    for (var i=0; i<numIslands; i++) {
    	islands[i].display();
    }
    drawWater();
    sorcerer.display();
    fill(255,255);
    strokeWeight(3);
    ellipse(highestPointX, highestPointY, 30, 30);
    /* State handling
	State 0 - Welcome screen
	State 1 - Playing game
	State 2 - Paused
	State 3 - Game Over
	*/
	if (state == 0) {
		introScreen();
	} else if (state == 1) {
		runGame();
		handleParticles();
		if (frameCounter % 15 === 0) starPower += 2;
	} else if (state == 2) {
		paused();
	} else if (state == 3) {
		gameOver();
	} 

	button.display(state);
	button.checkMouse();

	frameCounter++;
	//drawMoon();
	//moon.display();
}

function Button(xpos, ypos, w, h) {
	this.x = xpos;
	this.y = ypos;
	this.w = w;
	this.h = h;
	this.c = 200;

	this.display = function(icon) {
		fill(this.c);
		noStroke();

		if (icon === 2) { // Pause icon
			rect(this.x, this.y, this.w/3, this.h);
			rect(this.x+2*this.w/3, this.y, this.w/3, this.h);
		} else { // Play icon
			var x1 = this.x;
			var y1 = this.y;
			var x2 = this.x;
			var y2 = this.y+h;
			var x3 = this.x+w;
			var y3 = this.y+h/2;
			triangle(x1,y1,x2,y2,x3,y3);
		}
	}

	this.checkMouse = function() {
		if (mouseX>=this.x && mouseX <= this.x+w && mouseY>=this.y && mouseY<=this.y+h) {
			this.c = 255;
		} else {
			this.c = 200;
		}
	}
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
	textFont(titleFont);
	text("Game over!\nRefresh page to play again.", width/2, height/2+50);
	if (keyIsDown(ENTER) === true) {
		state = 1;
	}
}

function Island(radius) {
	this.numVertices = 20;
	this.verticesX = [];
	this.verticesY = [];
	this.jitter = radius/2;
	this.radius = radius;
	this.centerX = width/4 + random(width/2);
	this.centerY = height;
	this.colors = [];

	this.create = function() {
		var startAngle = random(TWO_PI);
		for (var i=0; i<this.numVertices; i++) {
			var radians = i*TWO_PI / float(this.numVertices);
			var x = this.centerX + (this.radius*cos(startAngle+radians)) / 2;
			var y = this.centerY + this.radius*sin(startAngle+radians) + random(-this.jitter, this.jitter);
			this.verticesX[i] = x;
			this.verticesY[i] = y;

			// Record highest point to place person there
			if (y > highestPointY) {
				highestPointX = x;
				highestPointY = y;
			}

			colorMode(HSB,100);
			this.colors[i] = color(random(3,10), random(50,90), random(20,60), 30); 
			colorMode(RGB,255);
		}
	}

	this.display = function() {
		//noFill();
		beginShape();
		for (var i=0; i<this.numVertices; i++) {
			vertex(this.verticesX[i],this.verticesY[i]);

			fill(this.colors[i]);
			var x1 = this.verticesX[i];
			var y1 = this.verticesY[i];
			var x2 = this.verticesX[(i+3)%this.numVertices];
			var y2 = this.verticesY[(i+3)%this.numVertices];
			var x3 = this.verticesX[(i+6)%this.numVertices];
			var y3 = this.verticesY[(i+6)%this.numVertices];
			triangle(x1,y1,x2,y2,x3,y3);
		}
		endShape(CLOSE);
		noStroke();
	}
}

function Person() {
	this.x = highestPointX;
	this.y = highestPointY;

	this.display = function() {
		fill(255);
		ellipse(this.x, this.y, 50, 50);
	}
}

function Moon(xpos, ypos, radius) {
	this.numVertices = 20;
	this.verticesX = [];
	this.verticesY = [];
	this.jitter = radius/20;
	this.radius = radius;
	this.centerX = xpos;
	this.centerY = ypos;
	this.colors = [];

	this.create = function() {
		var startAngle = random(TWO_PI);
		for (var i=0; i<this.numVertices; i++) {
			var radians = i*TWO_PI / float(this.numVertices);
			var x = this.centerX + this.radius*cos(startAngle+radians) + random(-this.jitter, this.jitter);
			var y = this.centerY + this.radius*sin(startAngle+radians) + random(-this.jitter, this.jitter);
			this.verticesX[i] = x;
			this.verticesY[i] = y;

			colorMode(HSB,100);
			this.colors[i] = color(random(8,11), random(20,50), random(20,100), 80); 
			colorMode(RGB,255);
		}
	}

	this.display = function() {
		//noFill();
		beginShape();
		for (var i=0; i<this.numVertices; i++) {
			vertex(this.verticesX[i],this.verticesY[i]);

			fill(this.colors[i]);
			var x1 = this.verticesX[i];
			var y1 = this.verticesY[i];
			var x2 = this.verticesX[(i+3)%this.numVertices];
			var y2 = this.verticesY[(i+3)%this.numVertices];
			var x3 = this.verticesX[(i+6)%this.numVertices];
			var y3 = this.verticesY[(i+6)%this.numVertices];
			triangle(x1,y1,x2,y2,x3,y3);

		}
		endShape(CLOSE);
		noStroke();
	}
}

function drawSun(xpos, ypos, radius) {
	colorMode(HSB,100);
	c = color(random(10,20), 50, random(80,100)); 
	stroke(c);
	colorMode(RGB,255);
	strokeWeight(1);
	noFill();

	var jitter = radius*2;
	var vertices = radius/2;
	var radius = radius;
	var centerX = xpos;
	var centerY = ypos;
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
		stroke(55 + lineOsc*5 - frameOsc*5, 70, 80, 50); //random(200,255), random(150,200), random(0,50));
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

	textAlign(LEFT);
	textSize(scoreBrightness*100/255);
	textFont(titleFont);
	text(score, 40, height/2);
}

function paused() {
	cursor(); // In-built function to show standard cursor
	displayScore();
	for (var i=0; i<numParticles; i++) {
		particles[i].display();
	}
	drawTitle();
	fill(255);
	textSize(26);
	textFont(titleFont);
	text("Game paused.\nTap / Press ENTER to resume.", width/2, height/2+100);
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
	textSize(100);
	textFont(titleFont);
	text("RainCatcher", width/2, height/2);
}

function introScreen() {
	drawTitle();
	textSize(26);
	textFont(titleFont);
	text("Use the cursor to catch raindrops.\nTap / Press ENTER to begin.", width/2, height/2+100);
	if (keyIsDown(ENTER) === true) {
		state = 1;
	}
}

function drawCursor() {
	noCursor(); // In-built function to hide cursor
	// Draw cursor tail
	colorMode(HSB,100);
    strokeWeight(2);
    stroke(12, 30, 100);
	colorMode(RGB,255);
    line(mouseX, mouseY, pmouseX, pmouseY);
    colorMode(HSB,100);
    strokeWeight(2);
    stroke(20, 50, 100);
	colorMode(RGB,255);
	var j = 10;
    line(mouseX+random(-j,j), mouseY+random(-j,j), pmouseX+random(-j,j), pmouseY+random(-j,j));
    
    // Draw starpower radius
    colorMode(HSB,100);
    noFill();
    strokeWeight(1);
    stroke(0, 0, 100, 10);
	colorMode(RGB,255);
    //ellipse(mouseX, mouseY, (catchSize+starPower)*5, (catchSize+starPower)*5);
    
    // Draw sun
    drawSun(mouseX, mouseY, catchSize);
	
	catchSize = constrain(catchSize-5, 10, 500);
}

function touchMoved() {
	// Draw cursor tail
	colorMode(HSB,100);
	fill(12, 30, 100);
    strokeWeight(2);
    stroke(12, 30, 100);
	colorMode(RGB,255);
    line(mouseX, mouseY, pmouseX, pmouseY);
    
    // Draw starpower radius
    colorMode(HSB,100);
    noFill();
    strokeWeight(1);
    stroke(0, 0, 100, 10);
	colorMode(RGB,255);
    //ellipse(mouseX, mouseY, (catchSize+starPower)*5, (catchSize+starPower)*5);
    
    // Draw sun
    drawSun(mouseX, mouseY, catchSize);
	
	catchSize = constrain(catchSize-5, 10, 500);	
}

function mouseClicked() {
	state = 1;
	//ellipse(mouseX, mouseY, 5, 5);
	catchSize = catchSize + starPower;
	starPower = 0;

	if (mouseX>=button.x && mouseX <= button.x+w && mouseY>=button.y && mouseY<=button.y+h) {
		if (state === 2) state = 1;
		else if (state === 1) state = 2;
	}
}

function touchStarted() {
	state = 1;
	//ellipse(mouseX, mouseY, 5, 5);
	catchSize = catchSize + starPower;
	starPower = 0;

	if (mouseX>=button.x && mouseX <= button.x+w && mouseY>=button.y && mouseY<=button.y+h) {
		if (state === 2) state = 1;
		else if (state === 1) state = 2;
	}
}

function Particle(index) {
	this.x = random(width);
	this.y = random(2*height)-2*height;
	this.index = index;
	this.diameter = random(2, 5);
	this.jitter = 1;
	
	colorMode(HSB,100);
	this.c = color(random(50,60), random(0,70), random(80,100)); 
	colorMode(RGB,255);

	this.children = [];
	this.hasChildren = false;
	this.numChildren = this.diameter;

	this.display = function() {
		fill(this.c);
		ellipse(this.x+random(-this.jitter,this.jitter), this.y+random(-this.jitter,this.jitter), this.diameter, this.diameter);
	}

	this.fall = function() {
		if (this.y >= height-this.diameter/2-waterLevel) {
			this.melt();
		} else {
			this.y = constrain(this.y+7, -2*height, height-waterLevel);
		}
	}

	this.melt = function() {
		if (random(100)>60) this.y = this.y + 1;
		if (random(100)>90) {
			this.diameter = this.diameter-1;
			if (state === 1) {
				waterLevel = waterLevel+0.2;
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
		if (abs(this.y-mouseY)<catchSize*4 && abs(this.x-mouseX)<catchSize*4) {
			this.explode();
			this.hasChildren = true;
		} 
	}

	this.explode = function() {
		//note = 12*octave + pentatonicScale[int(random(0,pentatonicScale.length))];
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
			//if (this.children[i].y > 0) {
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
	this.velX = random(-8,8);
	this.velY = random(-5,5);
	this.diameter = random(1,2);
	this.c = 255; //random(200,255), random(150,200), random(0,50));

	this.display = function() {
		if (random(100) > 50) {
			fill(this.c);
			ellipse(this.x, this.y, this.diameter, this.diameter);
		}
	}

	this.move = function() {
		this.x = this.x + this.velX;
		this.y = this.y + this.velY;
		this.x = this.x - (this.x/abs(this.x));
		this.velY = this.velY + 2;
	}

}

