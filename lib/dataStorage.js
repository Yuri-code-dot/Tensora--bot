/**
 * Data Storage Module
 * Handles JSONL records and memory persistence
 */

const fs = require("fs");
const path = require("path");

const DATASETS_DIR = path.join(process.cwd(), "datasets");
const RECORDS_FILE = path.join(DATASETS_DIR, "records.jsonl");
const MEMORY_FILE = path.join(process.cwd(), "memory.json");

/**
 * Ensure datasets directory exists
 */
function ensureDatasetDir() {
  if (!fs.existsSync(DATASETS_DIR)) {
    fs.mkdirSync(DATASETS_DIR, { recursive: true });
    console.log(`[Storage] Created datasets directory`);
  }
}

/**
 * Load memory.json
 * @returns {Object} Memory object with defaults if file missing
 */
function loadMemory() {
  ensureDatasetDir();

  if (!fs.existsSync(MEMORY_FILE)) {
    console.log(`[Storage] memory.json not found, creating defaults`);
    const defaults = {
      processed_urls: [],
      last_run: "",
      records_collected: 0,
      version: "1.0",
    };
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }

  try {
    const data = fs.readFileSync(MEMORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`[Storage] Error reading memory.json:`, e.message);
    return {
      processed_urls: [],
      last_run: "",
      records_collected: 0,
      version: "1.0",
    };
  }
}

/**
 * Save memory.json
 * @param {Object} data - Memory object to save
 */
function saveMemory(data) {
  try {
    ensureDatasetDir();
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
    console.log(`[Storage] Memory saved (${data.records_collected} records)`);
  } catch (e) {
    console.error(`[Storage] Error saving memory.json:`, e.message);
  }
}

/**
 * Append a single record to records.jsonl
 * @param {Object} record - Record object to append
 */
function appendRecord(record) {
  try {
    ensureDatasetDir();

    // Validate record structure
    if (!record.url || !record.title) {
      console.warn(`[Storage] Invalid record, skipping:`, record);
      return false;
    }

    const jsonlLine = JSON.stringify(record) + "\n";
    fs.appendFileSync(RECORDS_FILE, jsonlLine);
    console.log(`[Storage] Record appended: ${record.title}`);
    return true;
  } catch (e) {
    console.error(`[Storage] Error appending record:`, e.message);
    return false;
  }
}

/**
 * Load all records from JSONL file
 * @returns {Array} Array of record objects
 */
function loadRecords() {
  try {
    ensureDatasetDir();

    if (!fs.existsSync(RECORDS_FILE)) {
      console.log(`[Storage] records.jsonl not found, returning empty array`);
      return [];
    }

    const data = fs.readFileSync(RECORDS_FILE, "utf-8");
    if (!data.trim()) return [];

    return data
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn(`[Storage] Skipping malformed JSONL line`);
          return null;
        }
      })
      .filter((record) => record !== null);
  } catch (e) {
    console.error(`[Storage] Error loading records:`, e.message);
    return [];
  }
}

/**
 * Get count of records in JSONL file
 * @returns {Number} Record count
 */
function getRecordCount() {
  try {
    ensureDatasetDir();

    if (!fs.existsSync(RECORDS_FILE)) {
      return 0;
    }

    const data = fs.readFileSync(RECORDS_FILE, "utf-8");
    if (!data.trim()) return 0;

    return data
      .split("\n")
      .filter((line) => line.trim()).length;
  } catch (e) {
    console.error(`[Storage] Error counting records:`, e.message);
    return 0;
  }
}

module.exports = {
  loadMemory,
  saveMemory,
  appendRecord,
  loadRecords,
  getRecordCount,
  ensureDatasetDir,
};