import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the valid words
const validWordsPath = path.join(__dirname, '../src/lib/validWords.ts');
const validWordsContent = fs.readFileSync(validWordsPath, 'utf-8');
const validWordsMatch = validWordsContent.match(/export const validWords = \[([\s\S]*?)\]/);
const validWordsString = validWordsMatch[1];
const validWords = validWordsString
  .split(',')
  .map(w => w.trim().replace(/['"]/g, ''))
  .filter(w => w.length > 0);

console.log(`Total words to process: ${validWords.length}`);

// Configuration
const API_BASE_URL = 'https://api.dicionario-aberto.net/word';
const DELAY_MS = 10; // Delay between requests to avoid rate limiting
const BATCH_SIZE = 100; // Save progress every N words
const OUTPUT_FILE = path.join(__dirname, '../src/lib/wordsWithDescriptions.ts');
const PROGRESS_FILE = path.join(__dirname, '../src/lib/wordsProgress.json');

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse XML to extract definition
function parseXmlDefinition(xmlString) {
  try {
    // Extract content between <def> tags
    const defMatch = xmlString.match(/<def>([\s\S]*?)<\/def>/);
    if (!defMatch) return null;
    
    let definition = defMatch[1];
    
    // Remove extra whitespace and newlines
    definition = definition
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Remove parenthetical references like (Cp. _barca_)
    definition = definition.replace(/\([^)]*\)/g, '').trim();
    
    return definition || null;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

// Fetch word definition from API
async function fetchWordDefinition(word) {
  try {
    const url = `${API_BASE_URL}/${encodeURIComponent(word)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`  ⚠️  ${word}: API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`  ⚠️  ${word}: No data returned`);
      return null;
    }
    
    // Get the first entry
    const entry = data[0];
    
    if (!entry.xml) {
      console.log(`  ⚠️  ${word}: No XML in response`);
      return null;
    }
    
    const description = parseXmlDefinition(entry.xml);
    
    if (!description) {
      console.log(`  ⚠️  ${word}: Could not extract definition`);
      return null;
    }
    
    return {
      text: word,
      description: description
    };
  } catch (error) {
    console.error(`  ❌ ${word}: Error - ${error.message}`);
    return null;
  }
}

// Load progress if exists
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  }
  return {
    processedWords: [],
    lastIndex: 0
  };
}

// Save progress
function saveProgress(processedWords, lastIndex) {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify({ processedWords, lastIndex }, null, 2)
  );
}

// Save final output
function saveFinalOutput(wordsWithDescriptions) {
  const tsContent = `export interface WordWithDescription {
  text: string;
  description: string;
}

export const wordsWithDescriptions: WordWithDescription[] = ${JSON.stringify(wordsWithDescriptions, null, 2)};
`;
  
  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`\n✅ Final output saved to ${OUTPUT_FILE}`);
}

// Main processing function
async function processWords() {
  const progress = loadProgress();
  const wordsWithDescriptions = progress.processedWords || [];
  let startIndex = progress.lastIndex || 0;
  
  console.log(`Starting from index ${startIndex}`);
  console.log(`Already processed: ${wordsWithDescriptions.length} words\n`);
  
  for (let i = startIndex; i < validWords.length; i++) {
    const word = validWords[i];
    console.log(`[${i + 1}/${validWords.length}] Processing: ${word}`);
    
    const result = await fetchWordDefinition(word);
    
    if (result) {
      wordsWithDescriptions.push(result);
      console.log(`  ✓ Added: ${result.description.substring(0, 50)}...`);
    }
    
    // Save progress every BATCH_SIZE words
    if ((i + 1) % BATCH_SIZE === 0) {
      saveProgress(wordsWithDescriptions, i + 1);
      console.log(`\n💾 Progress saved: ${wordsWithDescriptions.length} words processed\n`);
    }
    
    // Add delay to avoid rate limiting
    await sleep(DELAY_MS);
  }
  
  // Save final output
  saveProgress(wordsWithDescriptions, validWords.length);
  saveFinalOutput(wordsWithDescriptions);
  
  console.log(`\n🎉 Processing complete!`);
  console.log(`Total words with descriptions: ${wordsWithDescriptions.length}`);
  console.log(`Words without descriptions: ${validWords.length - wordsWithDescriptions.length}`);
  
  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

// Run the script
processWords().catch(console.error);

