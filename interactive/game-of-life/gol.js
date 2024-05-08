const board = document.getElementById("board");
const toggleButton = document.getElementById("start-game");
let play = false;
const width = 50;
let arr = Array.from({length: width}, () => Array(width).fill(false));

drawBoard();

function toggleGame() {
    play = !play
    if (play) {
        toggleButton.innerText = "Pause Game";
        startGame();
    } else {
        toggleButton.innerText = "Start Game";
    }
}

function startGame() {
    function loop() {
        if (play) {
            tick();
            setTimeout(loop, 100);
        }
    }
    loop();
}

function clearBoard() {
    updateBoard(Array.from({length: width}, () => Array(width).fill(false)));
}

function tick() {
    updatedBoard = checkCells();
    updateBoard(updatedBoard);
}

function updateBoard(updatedBoard) {
    arr = updatedBoard;
    drawBoard();
}

function drawBoard() {
    board.textContent = "";
    let isMouseDown = false;

    board.onmousedown = function() { isMouseDown = true; };
    document.onmouseup = function() {
        isMouseDown = false;
        const cells = board.querySelectorAll(".cell");
        cells.forEach(cell => cell.dragToggled = false);
    };

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dragToggled = false;
            cellAlive = arr[i][j];
            if (cellAlive) {
                cell.classList.add("alive");
            } else {
                cell.classList.add("dead");
            }
            (function(localI, localJ) {
                cell.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    toggleCellState(localI, localJ, this);
                    this.dragToggled = true;
                });
                cell.addEventListener('mousemove', function(e) {
                    if (isMouseDown && !this.dragToggled) {
                        e.preventDefault();
                        toggleCellState(localI, localJ, this);
                        this.dragToggled = true;
                    }
                });
            })(i, j);

            board.append(cell);
        }
    }
}

function toggleCellState(i, j, cellElement) {
    arr[i][j] = !arr[i][j];
    cellElement.classList.toggle("alive");
    cellElement.classList.toggle("dead");
}

function checkCells() {
    let updatedBoard = Array.from({length: width}, () => Array(width).fill(false));
    let numAlive = 0;
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < width; j++) {
            prevState = arr[i][j];
            let numNeighbors = countNeighbors(i, j);
            if (prevState) {
                if (numNeighbors === 2 || numNeighbors === 3) {
                    updatedBoard[i][j] = true;
                    numAlive++;
                }
            } else {
                if (numNeighbors === 3) {
                    updatedBoard[i][j] = true;
                    numAlive++;
                }
            }
        }
    }
    if (numAlive === 0) {
        toggleGame();
    }
    return updatedBoard
}

function countNeighbors(i, j) {
    let count = 0
    for (var n = -1; n <= 1; n++) {
        for (var m = -1; m <= 1; m++) {
            var new_i = i + n;
            var new_j = j + m;
            if (!(new_i === i && new_j === j)) {
                count += getCell(new_i, new_j);
            }
        }
    }
    return count;
}

function getCell(i, j) {
    if (!(i < 0 || i > width - 1 || j < 0 || j > width - 1)) {
        if (arr[i][j]) {
            return 1;
        }
    } 
    return 0;
}