import fs from 'node:fs';
import path from 'node:path';

const INPUT_DEFAULT = path.join('scripts', 'words_all_letters_smoke.txt');
const OUTPUT_DEFAULT = path.join('scripts', 'words_all_letters_smoke.array.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { input: INPUT_DEFAULT, output: OUTPUT_DEFAULT };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--input' && args[i + 1]) {
      opts.input = args[++i];
    } else if (a === '--output' && args[i + 1]) {
      opts.output = args[++i];
    }
  }
  return opts;
}

function readLines(filePath) {
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
  return content.split(/\r?\n/);
}

function filterWords(lines) {
  const out = [];
  const seen = new Set();
  for (const raw of lines) {
    const w = raw.trim();
    if (!w) continue;
    if (/\s/.test(w)) continue; // skip words with any whitespace
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

function writeJsArray(filePath, words) {
  const arrayLiteral = JSON.stringify(words, null, 2);
  const js = `export const words = ${arrayLiteral};\n`;
  fs.writeFileSync(filePath, js, { encoding: 'utf-8' });
}

function main() {
  const { input, output } = parseArgs();
  console.log(`[INFO] Reading: ${input}`);
  const lines = readLines(input);
  console.log(`[INFO] Total lines: ${lines.length}`);
  const words = filterWords(lines);
  console.log(`[INFO] Filtered words (no spaces): ${words.length}`);
  writeJsArray(output, words);
  console.log(`[INFO] Wrote JS array to: ${output}`);
}

main();


