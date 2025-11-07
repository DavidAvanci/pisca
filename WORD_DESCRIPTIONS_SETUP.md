# Word Descriptions Setup Guide

This guide explains how to fetch Portuguese word descriptions from the Dicionario Aberto API for all 9,150 words in your `validWords.ts` file.

## Overview

The setup includes:
- **Test script** - Tests the API with 5 sample words
- **Main script** - Fetches descriptions for all 9,150 words
- **Progress tracking** - Saves progress every 100 words
- **Error handling** - Gracefully handles API failures

## Quick Start

### Step 1: Test the API

First, verify the API works correctly:

```bash
npm run test-api
```

This will fetch descriptions for 5 sample words: `barco`, `casa`, `amor`, `feliz`, `água`.

**Expected output:**
```
Testing: barco
✓ Description: "Designação genérica de qualquer embarcação. Embarcação pequena sem coberta."

Result object:
{
  "text": "barco",
  "description": "Designação genérica de qualquer embarcação. Embarcação pequena sem coberta."
}
```

### Step 2: Fetch All Descriptions

Once the test works, run the full script:

```bash
npm run fetch-descriptions
```

**⚠️ Important:** This will take approximately 15-20 minutes to complete.

## What Happens

### Processing

The script will:
1. Load all 9,150 words from `src/lib/validWords.ts`
2. Fetch each word's definition from the API
3. Parse the XML response to extract the description
4. Build an array of objects with format: `{ text: "word", description: "..." }`
5. Save progress every 100 words
6. Generate the final TypeScript file

### Progress Tracking

```
[1/9150] Processing: ababa
  ✓ Added: Árvore da família das leguminosas...

[100/9150] Processing: achar
💾 Progress saved: 97 words processed

[200/9150] Processing: adobo
💾 Progress saved: 195 words processed
```

### Output Files

- **`src/lib/wordsWithDescriptions.ts`** - Final output file
  - TypeScript interface definition
  - Array of all words with descriptions
  - Ready to import and use in your app

- **`src/lib/wordsProgress.json`** - Temporary progress file
  - Tracks processed words
  - Allows resuming if interrupted
  - Automatically deleted when complete

## Resuming After Interruption

If the script is interrupted (Ctrl+C, network error, etc.):

1. Simply run it again: `npm run fetch-descriptions`
2. It will automatically resume from the last checkpoint
3. No need to start over!

## Output Format

The generated `wordsWithDescriptions.ts` file will look like:

```typescript
export interface WordWithDescription {
  text: string;
  description: string;
}

export const wordsWithDescriptions: WordWithDescription[] = [
  {
    "text": "ababa",
    "description": "Árvore da família das leguminosas..."
  },
  {
    "text": "barco",
    "description": "Designação genérica de qualquer embarcação. Embarcação pequena sem coberta."
  },
  // ... 9,148 more entries
];
```

## Using the Data

After generation, import and use the data in your app:

```typescript
import { wordsWithDescriptions } from './lib/wordsWithDescriptions';

// Example: Find a word's description
const word = wordsWithDescriptions.find(w => w.text === 'barco');
console.log(word?.description);
// Output: "Designação genérica de qualquer embarcação. Embarcação pequena sem coberta."

// Example: Filter words with descriptions
const wordsWithDef = wordsWithDescriptions.filter(w => w.description);
console.log(`Words with descriptions: ${wordsWithDef.length}`);
```

## Configuration

You can modify these settings in `scripts/fetchWordDescriptions.js`:

```javascript
const DELAY_MS = 100;      // Delay between requests (ms)
const BATCH_SIZE = 100;    // Save progress every N words
```

**Note:** Decreasing `DELAY_MS` may cause rate limiting issues with the API.

## Troubleshooting

### "API returned 404"
- Some words may not exist in the dictionary
- This is normal and expected
- The script will skip these words

### "Network error"
- Check your internet connection
- The API may be temporarily unavailable
- Run the script again to resume

### "Too many requests"
- Increase `DELAY_MS` to 200 or higher
- This adds more delay between API calls

## API Information

- **Endpoint:** `https://api.dicionario-aberto.net/word/{word}`
- **Method:** GET
- **Response:** JSON array with word entries
- **Rate Limit:** Unknown (we use 100ms delay to be safe)

## Files Created

```
scripts/
  ├── fetchWordDescriptions.js  # Main script
  ├── testApi.js                # Test script
  └── README.md                 # Script documentation

src/lib/
  ├── validWords.ts             # Original word list (unchanged)
  ├── wordsWithDescriptions.ts  # Generated output ✨
  └── wordsProgress.json        # Temporary (auto-deleted)
```

## Next Steps

After running the script successfully:

1. The new `wordsWithDescriptions.ts` file is ready to use
2. Import it in your components
3. Display word descriptions in your game
4. Consider adding a fallback for words without descriptions

## Questions?

- Check `scripts/README.md` for more details
- Review the script code for customization options
- Test with `npm run test-api` before running the full script

