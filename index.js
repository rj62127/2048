document.addEventListener("DOMContentLoaded", function (){
    // wait till the browser is ready to render the game (avoids glitches)
    window.webkitRequestAnimationFrame(function ()
    {
        var manager = new gameManager(4, KeyboardInputManager,HTMLActurator);

    });
});

function GameManager(size, InputManager, Actuator){
    this.size  = size; // size of grid
    this.InputManager = new InputManager;
    this.Actuator = new Actuator;
    this.startTiles = 2;

    this.InputManager.on("move",
this.move.bind(this));
    this.inputManager.on("restart",
    this.restart.bind(this));

    this.setup();


};

// Set up the game
GameManager.prototype.setup = function () {
    this.grid = new Grid(this.size);

    this.score = 0;
    this.over  = false;
    this.won   = false;

    // Add the initial tiles
    this.AddStartTiles();

    // Update the Actuator
    this.actuate();


};
// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles= function(){
    for(var i=0; i < this.startTiles; i++)
    {
        this.addRandomTile();

    }

};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function (){
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(),
        value);

        this.grid.insertTile(title);

    }

};
// Send the updates grid to the actuator
GameManager.prototype.actuate = function(){
    this.actuator.actuate(this.grid, {
        score: this.score,
        over:  this.oover,
        won :  this.won,
    });
};

// save all tile position and remove merge tile information
GameManager.prototype.prepareTiles = function (){
    this.grid.eachCell(function (x, y, tile)
    {
        if (tile){
            tile.mergedForm = null;
            title.savePosition();

        };
    });
};

// Move  tiles on the grid in the any direction 
GameManager.prototype.moveTile = function(tile,cell){
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);


};

// Move tiles on the grid in any direction 
GameManager.prototype.move = function (direction){
    // 0: up , 1:right, 2:down, 3:left
    
    var self = this;

    if(this.over || this.won) return; // Don't do anything if the game is over's

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;
    // Save the current tile positions and remove merged info
    this.prepareTiles();
    // Traverse the grid in the right direction and move tiles 
    traversals.x.forEach(function (x){
        traversals.y.forEach(function (y){
            cell = {x: x, y: y};
            tile = self.grid.cellContent(cell);

            if(tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next = self.grid.cellContent(positions.next);

                // only one merger per row traversal 

                if (next && next.value === tile.value && !next.mergedfrom) {
                    var merged = new Tile(positions.next, tile.value*2);
                        merged.mergedForm =[tile,next];
                        self.grid.insertTile(merged);
                        self.grid.removeTile(tile);

                        // Covrage the two tiles position 
                    tile.updatePosition(position.next);

                    // Update the score 
                    self.won = true;

                }
                else {
                    self.moveTile(tile, positions.farthest);

                }
                if (!self.positionsEqual(cell,tile)){
                    moved = true;      //  The tile moved to the original cell !

                }

                

            }
        });
    });
    if (moved) {
        this.addRandomTile();

        if(!this.movesAvailable()){
            this.over = true; // Game is over!

        }
        this.actuate();
    }

};


// Get the vector represanting to the chosen direction 

GameManager.prototype.getVector = function(direction){
    // Vector representing the tile movement 
    var map = {
        0: {x: 0, y: -1}, // UP
        1: {x: 1, y: 0}, // RIGHT
        2: {x: 0, y: 1}, // DOWN
        3: {x: -1 y: 0}, // LEFT

    };

    return map[direction]
};

// Build a list of positions to traverse in the right order

GameManager.prototype.buildTraversals = function(vector) {
    var traversal = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++){
        traversals.x.push(pos);
        traversals.y.push(pos);
    }
    // Always traverse from the farthest cell in the chosen direction 

    if (vector.x == 1) traversals.x = traversals.x.reverse();
    if (vector.y == 1) traversals.y = traversals.y.reverse();

    return traversals;


};

GameManager.prototype.findFarthestPosition = function (cell, vector) { 
    var previous;

    // Progrems towards the vector direction until an obstacle is found 
    do {
        previous = cell;
        cell    = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellsAvailable(cell));

    return {
        farthest: previous,
        next: cell // check the merged is required 

    };
};

GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();


};

// Check for available matches between tiles 

GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;
    var tile;

    for (var x = 0; x < this.size; x++) {
        for ( var y = 0; y < this.size; y++) {
            tile = this.grid.cellContent({ x: x, y: y});

            if (tile) {
                for (var direction = 0; direction<4; direction++) {
                    var vector = self.getVector(direction);
                    var cell = { x: x + vector.x, y: y + vector.y };

                    var other = self.grid.cellContent(cell);
                    if (other){

                    }
                    if (other && other.value === tile.value) {
                        return true; // these two tiles can be merged 
                    }
                }

            }
        }
    }

    return false;


};

GameManager.prototype.positionsEqual = function ( first, second ) {
    return first.x === second.x && first.y === second.y;
};


function Grid(size) {
    this.size = size;

    this.cell = [];

    this.build();
}

// Build a grid  of the any size

Grid.prototype.build = function () {
    for( var x = 0; x < this.size; x++) {
        var row = this.cells[x] = [];

        for  (var y = 0; y < this.size; y++) {
            row.push(null);
        }
    }
};

// Now find the first available random location

Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();

    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];

    }
};
Grid.prototype.availableCells = function () {
    var cells = [];
    this.eachCell(function (x, y, tile) {
        if (!tile) {
            cells.push({x: x, y: y});
        }

    });
    return cells;

};

 // Return call back every cell

Grid.prototype.eachCell = function (callback) {
    for ( var x = 0; x < this.size; x++) {
        for ( var y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }


};

// If Any cell available 
grid.prototype.cellsAvailable = function () {
    return !!this.availableCells().length;
};

// Check the any cell is taken 
Grid.prototype.cellsAvailable = function (cell) {
    return !this.cellOccupied(cell);
};
Grid.prototype.cellOccupied = function (cell) {
    return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
    if ( this.withinBounds(cell)) {
        return this.cells[cell.x][cell.y];

    } else {
        return null;

    }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;

};

Grid.prototype.withinBounds = function (position) {
    return position.x>=0 && position.x<this.size && position.y>=0 && position.y<this.size;
};


function HTMLActurator() {
    this.tileContainer = document.getElementsByClassName("tile-container")[0];
    this.scoreContainer = document.getElementsByClassName("score-container")[0];
    this.messageContainer = document.getElementsByClassName("game-message")[0];

    this.score = 0;

}

HTMLActurator.prototype.actuate = function (grid, metadata) {
    var self = this;
    window.requestAnimationFrame(function (){
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function(column){
            column.forEach(function(cell){
                if(cell) {
                    self.addTile(cell);
                }
            });
                
        });
            self.updateScore(metadat.score);

            if (metadata.over) self.message(false); // lose
            if (metadata.won) self.message(true); // won
    });
    
};

HTMLActurator.prototype.restart = function () {
    this.clearMessage ();
};

HTMLActurator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

HTMLActurator.prototype.addTile = function(tile) {
    var self = this;
    var element = document.createElement("div");
    var position = tile.previousPosition || {x: tile.x, y:tile.y};
    positionClass = this.positionClass(position);

    // We can't use classlist bcqz it somehow glicz when replacing classes

    var classes = ["tile", "tile-", + tile.value, positionClass];
    this.applyClasses(element, classes);
    element.textContent = tile.value;

    if (tile.previousPosition) {
        window.requestAnimationFrame(function (){
            classes[2] = self.positionClass({ x: tile.x, y:tile.y});
            self.applyClasses(element, classes);
            // up to date the position 
        });
    } else if(tile.mergedForm) {
        classes.push("tile-merged");
        this.applyClasses(element, classes);
        // render the tile are merged
        tile.mergedForm.forEach(function (merged){
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        this.applyClasses(element, classes);
    }
    // put the tile on the board
    this.tileContainer.appendChild(element);
};

HTMLActurator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join (" "));
};
HTMLActurator.prototype.normalizePosition = function (position) {
    return{ x: position.x + 1, y: position.y + 1};
};

HTMLActurator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

HTMLActurator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);
    var difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+" + difference;



        this.scoreContainer.appendChild(addition);
    }
};

HTMLActurator.prototype,message = function (won) {
    var type  = won? "game-won" : "game-over";
    var message = won? "You win!" : "game-over!"

    this.messageContainer.classList.add(type);

    this.messageContainer.getElementsByTagName("p")[0].textContent = message;

};

HTMLActurator.prototype.clearMessage = function () {
    this.messageContainer.classList.remove("game-won", "game-over");
};

function KeyboardInputManager() {
    this.events = {};

    this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function(event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function(callback){
            callback(data);
        });
    }
};

KeyboardInputManager.prototype.listen = function () {
    var self = this;

    var map = {
        38: 0, //up
        39: 1, //right
        40: 2, //down
        37: 3, //left
        75: 0, //vim keybandinggs
        76: 1,
        74: 2,
        72: 3
    };
    document.addEventListener("keydown", function (event) {
        var modifiers = event.altkey || event.ctrlkey || event.metakey || event.shiftKey;
        var mapped  = map[event.which];

        if (!modifiers) {
            if (mapped !== undefined) {
                event.preventDefault();
                self.emit("move", mapped);

            }

            if (event.which === 32)
            self.restart.bind(self)(event);

        }
    });
    
    var retry = document.getElementsByClassName("retry-button")[0];
    retry.addEventListener("click", this.restart.bind(this));

    // Listen to swipe events 

    var gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT, Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];
    var gameContainer = document.getElementsByClassName("game-container")[0];
    var handler  = Hammer(gameContainer, {
        drag_block_horizontal: true,
        drag_block_vertical: true
    });

    handler.on("swipe", function (event) {
        event.gesture.preventDefault();
        mapped = gestures.indexOf(event.gesture.direction);

        if (mapped !==-1) self.emit("move", mapped);

    
    });
};

KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
};

function Tile(position, value) {
    this.x      = position.x;
    this.y      = position.y;
    this.value  = value || 2;

    this.previousPosition = null;
    this.mergedForm       = null; // Tracks tiles merged together


}

Tile.prototype.savePosition = function () {
    this.previousPosition = { x: this.x, y: this.y };

};


Tile.prototype.updatePosition = function (position) {
    this.x = position.x;
    this.y = position.y;

};


// THE END








