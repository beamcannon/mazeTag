var deltaX = 0;
var deltaY = 0;
var walls = [];
var player = 0;
var maze = 0;
var history = [];
createLevel();


function createLevel() {
	var gridSize = 25, horizontalSize = 20, verticalSize = 10;
	maze = new Array(horizontalSize * verticalSize); // linear representation
	//console.log("initializing");
	for (i = 0; i < horizontalSize; i++) {
		maze[i] = new Array(verticalSize);
		for (j = 0; j < verticalSize; j++) {
			maze[i][j] = new Array(4); // top, right, bottom, left
			maze[i][j][0] = 0;
			maze[i][j][1] = 0;
			maze[i][j][2] = 0;
			maze[i][j][3] = 0;
			if(j === 0) maze[i][j][0] = -1;
			if(j === verticalSize-1) maze[i][j][2] = -1;
			if(i === 0) maze[i][j][3] = -1;
			if(i === horizontalSize-1) maze[i][j][1] = -1;
		}
	}
	//console.log("maze structure initialized");
	var FromX = Math.floor((640/2.0)-(horizontalSize/2.0)*gridSize);
	var FromY = Math.floor((480/2.0)-(verticalSize/2.0)*gridSize);
	// boundaries of the maze
	// create Maze
	var currentPath = [Math.floor( randomBetween(0, horizontalSize * verticalSize) )];
	var pathLength = 1;
	var openings = 0;
	var wallamount = 0;
	//console.log("creating actual maze");
	while(pathLength !== 0){
		var currentPoint = currentPath.pop();
		var y = Math.floor(currentPoint / horizontalSize);
		var x = currentPoint % horizontalSize;
		var xDelta = 0;
		var yDelta = 0;
		//console.log("directions "+maze[x][y]);
		var newDirection = availableIndex(maze[x][y]);
		//console.log("picked "+newDirection);
		//console.log("currently at path length "+pathLength);
		if (newDirection !== -1){
			//console.log("found new direction");
			switch(newDirection){
				case 0: yDelta--; break;
				case 1: xDelta++; break;
				case 2: yDelta++; break;
				case 3: xDelta--; break;
			}
			if (history.indexOf((y+yDelta) * horizontalSize + x+xDelta) !== -1){
				//console.log("direction contained in history, creating wall");
				maze[x][y][newDirection] = -1;
				x += xDelta;
				y += yDelta;
				maze[x][y][newDirection > 1 ? newDirection -2 : newDirection +2] = -1;
				currentPath.push(currentPoint);
				wallamount++;
			} else {
				//console.log("direction not contained in history, creating opening");
				maze[x][y][newDirection] = 1;
				x += xDelta;
				y += yDelta;
				maze[x][y][newDirection > 1 ? newDirection -2 : newDirection +2] = 1;
				currentPath.push(currentPoint);
				currentPath.push(y * horizontalSize + x);
				pathLength++;
				openings++;
				history.push(currentPoint);
			}
		} else {
			//console.log("did not find new direction, backtracking");
			pathLength--;
		}
	}
	//console.log("maze complete");
	//console.log("openings: "+openings);
	//console.log("walls: "+wallamount);
	//console.log("places visited: "+history.length);
	
	// add vectors to walls
	for (k = 0; k < horizontalSize; k++) {
		for (l = 0; l < verticalSize; l++) {
			if (l === 0) walls.push({x1:FromX+k*gridSize, x2:FromX+(k+1)*gridSize, y1:FromY, y2:FromY});
			if (k === 0) walls.push({x1:FromX, x2:FromX, y1:FromY+l*gridSize, y2:FromY+(l+1)*gridSize});
			if(maze[k][l][1] == -1) walls.push({x1:FromX+(k+1)*gridSize, x2:FromX+(k+1)*gridSize, y1:FromY+l*gridSize, y2:FromY+(l+1)*gridSize});
			if(maze[k][l][2] == -1) walls.push({x1:FromX+k*gridSize, x2:FromX+(k+1)*gridSize, y1:FromY+(l+1)*gridSize, y2:FromY+(l+1)*gridSize});
		}
	}
	//console.log("added all walls");
	var startPoint = Math.round( randomBetween(0, horizontalSize * verticalSize) );
	var playerY = FromY + Math.floor(startPoint / horizontalSize) * gridSize + Math.floor(gridSize/2);
	var playerX = FromX + (startPoint % horizontalSize) * gridSize + Math.floor(gridSize/2);
	player = {x: playerX, y: playerY, gotoX: playerX, gotoY: playerY};
}

function listContains(list, value){
	for (var x in list){
		if (x == value) return true;
	}
	return false;
}

function availableIndex(input){
	// which is not -1 or 1
	optionsList = new Array(4);
	listlength = 0;
	for ( i = 0 ; i < input.length; i++){
		if(input[i] === 0){ 
			optionsList[listlength] = i;
			listlength++;
		}
	}
	if(listlength === 0) return -1;
	else return optionsList[Math.floor(randomBetween(0, listlength))];
}

function update () { 
	getDelta();
	player.gotoY = player.gotoY + deltaY; player.gotoX = player.gotoX + deltaX;
	if (noWallCollisions({x1:player.x,y1:player.y,x2:player.gotoX,y2:player.gotoY})) {
		player.x = player.gotoX; player.y = player.gotoY;
	} else {
		player.gotoX = player.x; player.gotoY = player.y;
	}
	/* 
	// Game logic goes here. Examples:
	keyWentDown (keycode); keyWentUp (keycode);
	mouse.isDown; mouse.wentDownAt.x; mouse.isNowAt.y;
	randomBetween (start,end);
	// Some more utility stuff in genericFunctions.js.
	*/ 
}

function render () { 
	clear();
	//var FromX = Math.floor((640/2.0)-(20/2.0)*25);
	//var FromY = Math.floor((480/2.0)-(10/2.0)*25);
	for ( var i = 0; i < walls.length; i++ ) {
		drawLine(walls[i].x1, walls[i].y1, walls[i].x2, walls[i].y2,"black");
	}
	//for ( var k = 0; k < walls.length; k++ ) {
	//	fillBox(FromX + (history[k] % 20)*25 + Math.round( randomBetween(-5, 5)) + 12, FromY + Math.floor(history[k] / 20)*25 + Math.round( randomBetween(-5, 5)) + 12, 5,5, "rgba(32, 45, 21, " + k/walls.length + ")");
	//}
	for ( var j = 0; j < walls.length; j++ ) {
		//drawShadow(player.x, player.y, walls[j].x1, walls[j].y1, walls[j].x2, walls[j].y2);
	}
	//fillBox(FromX-10, FromY-10, 20,20, "green");
	fillBox(player.gotoX-4, player.gotoY-4, 8,8, "lightblue");
	fillBox(player.x-4, player.y-4, 8,8, "blue");
	/* 
	// Graphics code goes here. Examples:
	clear ();
	fillBox (x,y,w,h,color);
	drawCircle (x,y,r,color); fillCircle (x,y,r,color);
	writeText (text,x,y,color);
	drawLine (x1,y1,x2,y2,color);
	*/ 
}

function drawShadow(lightX, lightY, wallX1, wallY1, wallX2, wallY2) {
	var angle1 = angleOfLine( wallX1,wallY1,lightX,lightY);
	var angle2 = angleOfLine( wallX2,wallY2,lightX,lightY);
	var line1 = lineFrom(wallX1,wallY1,1000,angle1);
	var line2 = lineFrom(wallX2,wallY2,1000,angle2);
	context.beginPath(); context.strokeStyle = "lightgrey"; context.fillStyle = "lightgrey";
	context.moveTo(wallX1,wallY1);
	context.lineTo(line1.x2,line1.y2);
	context.lineTo(line2.x2,line2.y2);
	context.lineTo(wallX2,wallY2);
	context.lineTo(wallX1,wallY1);
	context.fill(); context.fillStyle = "black"; context.strokeStyle = "black";
}

function getDelta(){
	deltaX = 0; deltaY = 0;
	if (87 in keysDown) deltaY -= 4;
	if (83 in keysDown) deltaY += 4;
	if (65 in keysDown) deltaX -= 4;
	if (68 in keysDown) deltaX += 4;
	if (38 in keysDown) deltaY -= 4;
	if (40 in keysDown) deltaY += 4;
	if (37 in keysDown) deltaX -= 4;
	if (39 in keysDown) deltaX += 4;
}

function noWallCollisions(line) {
	for ( var j = 0; j < walls.length; j++ ) { 
		var intersection = checkLineIntersection(line, walls[j]);
		if ( intersection.onLine1 && intersection.onLine2 ) return false; 
	}
	return true;
}

function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }


setInterval(function () { update(); render(); }, 20);