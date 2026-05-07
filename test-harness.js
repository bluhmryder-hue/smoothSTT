// test-harness.js
const { getWindowContext } = require('./index.cjs');

async function test() {
    console.log("Checking context...");
    const context = await getWindowContext();
    console.log("Result:", JSON.stringify(context, null, 2));
}

test();