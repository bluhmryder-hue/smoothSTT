const { getWindowContext } = require('../resources/@vidividivici/context-reader/index.cjs');

module.exports = {
  async getFocusedWindowContext() {
    try {
      return await getWindowContext();
    } catch (error) {
      console.error('context-reader failed:', error);
      return null;
    }
  },
};
