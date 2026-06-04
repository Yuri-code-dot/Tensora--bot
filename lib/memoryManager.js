/**
 * Memory Manager Module
 * High-level memory operations for the agent
 */

const { loadMemory, saveMemory } = require("./dataStorage");

/**
 * Initialize memory if it doesn't exist
 * @returns {Object} Memory object
 */
function initMemory() {
  const memory = loadMemory();
  if (!memory.version) {
    memory.version = "1.0";
    saveMemory(memory);
  }
  return memory;
}

/**
 * Check if URL has already been processed
 * @param {String} url - URL to check
 * @returns {Boolean} True if already processed
 */
function isUrlProcessed(url) {
  const memory = loadMemory();
  return memory.processed_urls.includes(url);
}

/**
 * Add URL to processed list
 * @param {String} url - URL to mark as processed
 */
function addProcessedUrl(url) {
  const memory = loadMemory();

  if (!memory.processed_urls.includes(url)) {
    memory.processed_urls.push(url);
    saveMemory(memory);
    console.log(`[Memory] URL tracked: ${url}`);
  }
}

/**
 * Update last run timestamp
 * @param {String} timestamp - ISO timestamp (defaults to now)
 */
function updateLastRun(timestamp = new Date().toISOString()) {
  const memory = loadMemory();
  memory.last_run = timestamp;
  saveMemory(memory);
  console.log(`[Memory] Last run updated: ${timestamp}`);
}

/**
 * Increment collected record counter
 * @param {Number} count - Number of records to add (default 1)
 */
function incrementRecordCount(count = 1) {
  const memory = loadMemory();
  memory.records_collected += count;
  saveMemory(memory);
  console.log(`[Memory] Record count: ${memory.records_collected}`);
}

/**
 * Get current memory state
 * @returns {Object} Current memory object
 */
function getMemory() {
  return loadMemory();
}

/**
 * Clear processed URLs (for testing/reset)
 * WARNING: Only call this for testing
 */
function clearProcessedUrls() {
  const memory = loadMemory();
  memory.processed_urls = [];
  saveMemory(memory);
  console.log(`[Memory] Processed URLs cleared (TEST ONLY)`);
}

module.exports = {
  initMemory,
  isUrlProcessed,
  addProcessedUrl,
  updateLastRun,
  incrementRecordCount,
  getMemory,
  clearProcessedUrls,
};