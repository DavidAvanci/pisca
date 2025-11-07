// Test script to verify the API works with a few sample words

const testWords = ['barco', 'casa', 'amor', 'feliz', 'água'];

function parseXmlDefinition(xmlString) {
  try {
    const defMatch = xmlString.match(/<def>([\s\S]*?)<\/def>/);
    if (!defMatch) return null;
    
    let definition = defMatch[1];
    definition = definition
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    definition = definition.replace(/\([^)]*\)/g, '').trim();
    
    return definition || null;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

async function testWord(word) {
  try {
    const url = `https://api.dicionario-aberto.net/word/${encodeURIComponent(word)}`;
    console.log(`\nTesting: ${word}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ API returned ${response.status}`);
      return;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`⚠️  No data returned`);
      return;
    }
    
    const entry = data[0];
    console.log(`✓ Found entry with word_id: ${entry.word_id}`);
    
    if (entry.xml) {
      const description = parseXmlDefinition(entry.xml);
      console.log(`✓ Description: "${description}"`);
      
      console.log('\nResult object:');
      console.log(JSON.stringify({
        text: word,
        description: description
      }, null, 2));
    } else {
      console.log(`⚠️  No XML in response`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('Testing Dicionario Aberto API\n');
  console.log('='.repeat(50));
  
  for (const word of testWords) {
    await testWord(word);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Test complete!');
}

runTests().catch(console.error);

