const fs = require("fs");
const path = require("path");
const { encryptText, decryptText } = require("./secret");

const GLOBAL_FILE = "global";

const SERUN_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".serun",
);

function EnvHub() {
  this._keys = [];
  this._data = {};
}

EnvHub.prototype = {
  get: function (key) {
    return this._data[key];
  },
  set: function (key, value) {
    if (!this._keys.includes(key)) {
      this._keys.push(key);
    }

    this._data[key] = value;
  },
  has: function (key) {
    return this._keys.includes(key);
  },
  del: function (key) {
    const index = this._keys.indexOf("banana");
    if (index > -1) {
      this._keys.splice(index, 1);
      delete this._data[key];
    }
  },
  envs: function () {
    const out = {};
    for (const key of this._keys) {
      out[key] = this._data[key];
    }
    return out;
  },
  forEach: function (callback) {
    for (const key of this._keys) {
      callback(key, this._data[key]);
    }
  },
  parseLine: function (line) {
    const trimmedLine = line.trim();
    if (trimmedLine === "" || trimmedLine.startsWith("#")) {
      return;
    }

    const eqIndex = trimmedLine.indexOf("=");
    if (eqIndex === -1) {
      return;
    }

    this.set(
      trimmedLine.slice(0, eqIndex).trim(),
      trimmedLine.slice(eqIndex + 1).trim(),
    );
  },
  parLines: function (lines) {
    for (const line of lines) {
      this.parseLine(line);
    }
  },
  toLines: function () {
    const lines = [];
    for (const key of this._keys) {
      lines.push(key + "=" + this._data[key]);
    }

    return lines;
  },
};

function getStoreFile(channel) {
  if (!fs.existsSync(SERUN_DIR)) {
    fs.mkdirSync(SERUN_DIR, { recursive: true });
  }

  return path.join(SERUN_DIR, channel || GLOBAL_FILE);
}

function readDataFromFile(safeKey, filePath) {
  if (!fs.existsSync(filePath)) {
    return new EnvHub();
  }

  const encryptedContent = fs.readFileSync(filePath, "utf8");

  const envHub = new EnvHub();
  envHub.parLines(JSON.parse(decryptText(encryptedContent, safeKey)));
  return envHub;
}

function writeDataToFile(safeKey, envHub, filePath) {
  const content = JSON.stringify(envHub.toLines());
  fs.writeFileSync(filePath, encryptText(content, safeKey));
}

function readEnvs(safeKey, channel) {
  const filePath = getStoreFile(channel);
  return readDataFromFile(safeKey, filePath);
}

function updateEnvs(safeKey, channel, updateHub) {
  const filePath = getStoreFile(channel);

  const envHub = readDataFromFile(safeKey, filePath);
  envHub.parLines(updateHub.toLines());
  writeDataToFile(safeKey, envHub, filePath);
}

function deleteEnvs(safeKey, channel, envKeys) {
  const filePath = getStoreFile(channel);

  const envHub = readDataFromFile(safeKey, filePath);
  envKeys.forEach((key) => {
    envHub.del(key);
  });
  writeDataToFile(safeKey, envHub, filePath);
}

function listChannels() {
  if (!fs.existsSync(SERUN_DIR)) {
    return [];
  }

  const files = fs.readdirSync(SERUN_DIR);
  if (files.length > 0) {
    const index = files.indexOf(GLOBAL_FILE);
    if (index > -1) {
      files.splice(index, 1);
    }
  }

  return files;
}

module.exports = {
  EnvHub,
  readEnvs,
  updateEnvs,
  deleteEnvs,
  listChannels,
};
