/**
 * SmoothSTT Developer Test Harness
 * Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
 */
const { getWindowContext } = require('./lib/context-bridge.cjs');

async function testScraper() {
  console.log("Testing ContextReader.exe...");
  const context = await getWindowContext();
  if (context) {
    console.log("Scrape Success:", context);
  } else {
    console.log("Scrape Failed (Are you on Windows?)");
  }
}

// Run basic test
testScraper();
