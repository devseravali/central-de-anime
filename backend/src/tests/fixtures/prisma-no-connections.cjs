const fs = require('node:fs');
const net = require('node:net');
const tls = require('node:tls');
const childProcess = require('node:child_process');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const { syncBuiltinESMExports } = require('node:module');

function stop(marker) {
  process.stderr.write(`${marker}\n`);
  throw new Error(marker);
}

net.Socket.prototype.connect = function () { return stop('PRISMA_TEST_NETWORK_BLOCKED'); };
tls.connect = function () { return stop('PRISMA_TEST_NETWORK_BLOCKED'); };

function isEnvironmentFile(filename) {
  if (typeof filename !== 'string' && !(filename instanceof URL) && !Buffer.isBuffer(filename)) return false;
  const value = filename instanceof URL ? fileURLToPath(filename) : filename.toString();
  return /^\.env(?:\.|$)/.test(path.basename(value));
}

const readFileSync = fs.readFileSync;
fs.readFileSync = function (filename, ...args) {
  if (isEnvironmentFile(filename)) return stop('PRISMA_TEST_STOP_BEFORE_CONNECTION_CONFIG');
  return readFileSync.call(this, filename, ...args);
};
const readFile = fs.promises.readFile;
fs.promises.readFile = async function (filename, ...args) {
  if (isEnvironmentFile(filename)) return stop('PRISMA_TEST_STOP_BEFORE_CONNECTION_CONFIG');
  return readFile.call(this, filename, ...args);
};

// Only the npm -> shell -> Node CLI chain is permitted, never a native SQL engine.
for (const method of ['spawn', 'spawnSync', 'execFile', 'execFileSync']) {
  const original = childProcess[method];
  childProcess[method] = function (command, ...args) {
    if (!/^(node(?:\.exe)?|cmd\.exe|sh|bash)$/.test(path.basename(command).toLowerCase())) {
      return stop('PRISMA_TEST_ENGINE_BLOCKED');
    }
    return original.call(this, command, ...args);
  };
}
syncBuiltinESMExports();
