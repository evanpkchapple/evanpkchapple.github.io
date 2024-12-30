function addVectors(a, b) {
    const result = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] + b[i];
    }
    return result;
  }

function subtractVectors(a, b) {
    const result = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] - b[i];
    }
    return result;
  }
  
function cosineSimilarity(a, b) {
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
function findMostSimilar(embeddings, queryVector, topN = 5) {
    const results = [];
  
    for (const [word, vector] of Object.entries(embeddings)) {
      const sim = cosineSimilarity(queryVector, vector);
      results.push({ word, similarity: sim });
    }
  
    results.sort((a, b) => b.similarity - a.similarity);
  
    return results.slice(0, topN);
  }

export { addVectors, subtractVectors, findMostSimilar };
