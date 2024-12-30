async function loadGloveEmbeddings(filePath) {
    const response = await fetch(filePath);
    const text = await response.text();
    const embeddings = {};
  
    const lines = text.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(' ');
      if (parts.length > 1) {
        const word = parts[0];
        const vector = parts.slice(1).map(Number);
        embeddings[word] = new Float32Array(vector);
      }
    }
    return embeddings;
  }
  
  export { loadGloveEmbeddings };
  