let learnedMerges = [];

console.log("Page loaded. Ready to train tokenizer once you pick a file...");

function updateSliderValue() {
  const slider = document.getElementById('bpeSlider');
  document.getElementById('sliderValue').innerText = slider.value;
}

async function trainTokenizer() {
  console.clear();

  const fileSelect = document.getElementById('trainFileSelect');
  const fileUrl = fileSelect.value;  
  console.log("Fetching training text from:", fileUrl);

  let trainText = "";
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    trainText = await response.text();
  } catch (err) {
    console.error("Failed to fetch training text:", err);
    return;
  }

  let tokens = trainText.split('');
  learnedMerges = [];

  const maxTrainingMerges = 200;

  for (let step = 0; step < maxTrainingMerges; step++) {
    const pairCounts = {};

    for (let i = 0; i < tokens.length - 1; i++) {
      const pair = tokens[i] + '||' + tokens[i + 1];
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }

    let bestPair = null;
    let bestCount = 0;
    for (const pair in pairCounts) {
      if (pairCounts[pair] > bestCount) {
        bestCount = pairCounts[pair];
        bestPair = pair;
      }
    }

    if (!bestPair || bestCount < 2) {
      console.log("No more merges needed at step:", step);
      break;
    }

    const [first, second] = bestPair.split('||');

    learnedMerges.push([first, second]);

    const newTokens = [];
    let i = 0;
    while (i < tokens.length) {
      if (i < tokens.length - 1 && tokens[i] === first && tokens[i + 1] === second) {
        newTokens.push(first + second);
        i += 2;
      } else {
        newTokens.push(tokens[i]);
        i += 1;
      }
    }
    tokens = newTokens;
  }

  console.log("Training complete. Learned merges:", learnedMerges);
  console.log(`Total merges: ${learnedMerges.length}`);

  document.getElementById('maxMerges').innerText = learnedMerges.length;

  tokenizeInput();
}

function tokenizeInput() {
  const input = document.getElementById('inputText').value;
  const sliderVal = parseInt(document.getElementById('bpeSlider').value, 10);

  if (!learnedMerges.length || !input) {
    showTokens(input.split(''));
    return;
  }

  let tokens = input.split('');

  const mergesToApply = Math.min(sliderVal, learnedMerges.length);

  for (let m = 0; m < mergesToApply; m++) {
    const [first, second] = learnedMerges[m];
    const newTokens = [];
    let i = 0;
    while (i < tokens.length) {
      if (
        i < tokens.length - 1 &&
        tokens[i] === first &&
        tokens[i + 1] === second
      ) {
        newTokens.push(first + second);
        i += 2;
      } else {
        newTokens.push(tokens[i]);
        i += 1;
      }
    }
    tokens = newTokens;
  }

  showTokens(tokens);
}

function showTokens(tokens) {
  const outputDiv = document.getElementById('tokenizedOutput');
  const htmlSpans = tokens.map(t => {
    return `<span class="token-underline">${escapeHtml(t)}</span>`;
  });
  outputDiv.innerHTML = htmlSpans.join(' ');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.addEventListener('load', () => {
  trainTokenizer();
});