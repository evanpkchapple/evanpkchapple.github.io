import { addVectors, subtractVectors, findMostSimilar } from './utils/vectorProcessing.js';
import { loadGloveEmbeddings } from './utils/loadGlove.js';

let embeddings;
const tileSize = 70;
const margin = 20;

let allWords = new Set(['fire', 'water', 'earth', 'air']);

let spawnOffset = 0;

(async () => {
  
  document.getElementById('status').innerHTML = "Loading GloVe embeddings..."
  embeddings = await loadGloveEmbeddings('./glove/vectors.txt');
  document.getElementById('status').innerHTML = "Embeddings loaded."
  setTimeout(function() {
    document.getElementById('status').innerHTML = "";
  }, 5000);
})();

window.addEventListener('DOMContentLoaded', () => {
  initializeGame();
  setupTileSubmission()
  updateWordList();
});

function initializeGame() {
    const initialTiles = ['fire', 'water', 'earth', 'air'];
    const container = document.getElementById('tileContainer');
  
    const containerRect = container.getBoundingClientRect();
    const centerY = (containerRect.height / 2) - (tileSize / 2);
  
    let startX = 20;
    initialTiles.forEach((word, index) => {
      const xPos = startX + index * (tileSize + margin);
      createTileAtPosition(word, xPos, centerY);
    });
  
    window.addEventListener('resize', shiftTilesWithinBounds);
  }
  
 function createTileAtPosition(text, x, y) {
    const container = document.getElementById('tileContainer');
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.innerText = text;
  
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
  
    enableDragAndToggleColor(tile);
    container.appendChild(tile);
  }
  
  function createTileDiagonal(word) {
    const container = document.getElementById('tileContainer');
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.innerText = word;
  
    const containerRect = container.getBoundingClientRect();
  
    let startX = (containerRect.width - tileSize) / 2 + spawnOffset;
    let startY = (containerRect.height - tileSize) / 2 + spawnOffset;
    spawnOffset += 10;

    if (spawnOffset > 100) {
        spawnOffset = 0;
    }
  
    startX = Math.max(0, Math.min(startX, containerRect.width - tileSize));
    startY = Math.max(0, Math.min(startY, containerRect.height - tileSize));
  
    tile.style.left = `${startX}px`;
    tile.style.top = `${startY}px`;
  
    enableDragAndToggleColor(tile);
    container.appendChild(tile);
  }

  function setupTileSubmission() {
    const input = document.getElementById('newTileInput');
    const addButton = document.getElementById('addTileButton');
  
    function addTile() {
      const word = input.value.trim();
      if (word && !allWords.has(word) && word in embeddings) {
        allWords.add(word);
        updateWordList();
        createTileDiagonal(word);
        input.value = '';
      } else {
        alert("Tile already exists or input is not in embedding space.");
      }
    }
  
    addButton.addEventListener('click', addTile);
  
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTile();
      }
    });
  }
 
  function updateWordList() {
    const wordListEl = document.getElementById('wordList');
    wordListEl.innerHTML = '';
  
    const sortedWords = Array.from(allWords).sort();
  
    sortedWords.forEach((word) => {
      const li = document.createElement('li');
      li.textContent = word;
      li.addEventListener('click', () => {
        createTileDiagonal(word);
      });
      wordListEl.appendChild(li);
    });
  }

  function enableDragAndToggleColor(tile) {
    let offsetX, offsetY;
    let containerRect;
  
    tile.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      tile.classList.toggle('red-tile');
    });
  
    tile.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
  
      e.preventDefault();
      containerRect = tile.parentElement.getBoundingClientRect();
  
      offsetX = e.clientX - tile.getBoundingClientRect().left;
      offsetY = e.clientY - tile.getBoundingClientRect().top;
  
      function moveTile(e) {
        const newX = e.clientX - containerRect.left - offsetX;
        const newY = e.clientY - containerRect.top - offsetY;
  
        const clampedX = Math.max(0, Math.min(newX, containerRect.width - tileSize));
        const clampedY = Math.max(0, Math.min(newY, containerRect.height - tileSize));
  
        tile.style.left = `${clampedX}px`;
        tile.style.top = `${clampedY}px`;
      }
  
      function stopTileDrag() {
        window.removeEventListener('mousemove', moveTile);
        window.removeEventListener('mouseup', stopTileDrag);
        checkForCombination(tile);
      }
  
      window.addEventListener('mousemove', moveTile);
      window.addEventListener('mouseup', stopTileDrag);
    });
  }
  
  function checkForCombination(draggedTile) {
    const tiles = document.querySelectorAll('.tile');
  
    tiles.forEach((targetTile) => {
      if (draggedTile !== targetTile && isOverlapping(draggedTile, targetTile)) {
        const newWord = combineTiles(
          draggedTile.innerText,
          targetTile.innerText,
          draggedTile.classList.contains('red-tile'),
          targetTile.classList.contains('red-tile')
        );
        if (newWord) {
          targetTile.innerText = newWord;
          targetTile.classList.remove('red-tile');
          draggedTile.remove();
  
          document.getElementById('output').innerText = `Created: ${newWord}`;
  
          allWords.add(newWord);
          updateWordList();
        }
      }
    });
  }
  
  function isOverlapping(tile1, tile2) {
    const rect1 = tile1.getBoundingClientRect();
    const rect2 = tile2.getBoundingClientRect();
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
  
  function combineTiles(wordDragged, wordTarget, isDraggedRed, isTargetRed) {
    if (!embeddings) return null;
  
    const vDragged = embeddings[wordDragged];
    const vTarget = embeddings[wordTarget];
    if (!vDragged || !vTarget) return null;
  
    let combinedVector;
    let equation;
  
    if (isDraggedRed) {
      combinedVector = subtractVectors(vTarget, vDragged);
      equation = `${wordTarget} - ${wordDragged}`;
    } else if (isTargetRed) {
      combinedVector = subtractVectors(vDragged, vTarget);
      equation = `${wordDragged} - ${wordTarget}`;
    } else {
      combinedVector = addVectors(vDragged, vTarget);
      equation = `${wordDragged} + ${wordTarget}`;
    }
  
    const results = findMostSimilar(embeddings, combinedVector, 10);
    const filtered = results.filter((r) => r.word !== wordDragged && r.word !== wordTarget);
    const newWord = filtered[0]?.word || 'unknown';
  
    console.log(`${equation} => ${newWord}`);
    return newWord;
  }
  
  function shiftTilesWithinBounds() {
    const container = document.getElementById('tileContainer');
    const containerRect = container.getBoundingClientRect();
  
    document.querySelectorAll('.tile').forEach((tile) => {
      const rect = tile.getBoundingClientRect();
      let currentX = rect.left - containerRect.left;
      let currentY = rect.top - containerRect.top;
  
      currentX = Math.max(0, Math.min(currentX, containerRect.width - tileSize));
      currentY = Math.max(0, Math.min(currentY, containerRect.height - tileSize));
  
      tile.style.left = `${currentX}px`;
      tile.style.top = `${currentY}px`;
    });
  }