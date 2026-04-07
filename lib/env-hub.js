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
    const index = this._keys.indexOf(key);
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
  parseLines: function (lines) {
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

module.exports = {
  EnvHub,
};
