const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const { EventEmitter } = require('node:events');

function startup(environment, localKey = 'local-fixture-only') {
  const observed = { logs: [], warnings: [] };
  const server = new EventEmitter();
  const app = { disable() {}, set() {}, get() {}, use() {}, listen(port, host, callback) {
    observed.port = port; observed.host = host; callback(); return server;
  } };
  const module = { exports: {} };
  const requireMock = name => {
    if (name === 'express') return () => app;
    if (name === 'dotenv') return { config(options) {
      observed.isolatedDotenv = options.processEnv;
      return { parsed: { DATA_GO_KR_SERVICE_KEY: localKey } };
    } };
    if (name === './server/tide-service.cjs') return { createTideService(options) {
      observed.key = options?.serviceKey;
      return { configured: Boolean(options?.serviceKey && options.serviceKey !== 'YOUR_SERVICE_KEY_HERE') };
    }, TideError: class extends Error {} };
    if (name === './species-catalog.json') return require('../species-catalog.json');
    return require(name);
  };
  const context = vm.createContext({ require: requireMock, module, __dirname: require('node:path').resolve(__dirname, '..'),
    process: { env: { ...environment } }, console: { log: value => observed.logs.push(value), warn: value => observed.warnings.push(value) } });
  vm.runInContext(fs.readFileSync(require.resolve('../server.js'), 'utf8'), context);
  module.exports.startServer();
  return observed;
}

test('production startup uses platform key/port and a public bind address without logging credentials', () => {
  const observed = startup({ NODE_ENV: 'production', PORT: '32145', DATA_GO_KR_SERVICE_KEY: 'platform-fixture-only' });
  assert.equal(observed.key, 'platform-fixture-only');
  assert.equal(observed.port, 32145);
  assert.equal(observed.host, '0.0.0.0');
  assert.equal(Object.keys(observed.isolatedDotenv).length, 0);
  assert.deepEqual(observed.warnings, []);
  assert.doesNotMatch(observed.logs.join('\n'), /platform-fixture-only|local-fixture-only/);
  assert.equal(startup({ NODE_ENV: 'production', HOST: '127.0.0.1' }).host, '0.0.0.0');
  const render = startup({ PORT: '10000', HOST: 'localhost' });
  assert.equal(render.port, 10000);
  assert.equal(render.host, '0.0.0.0');
  assert.ok(render.logs.includes('Jeju Fishing Map: http://0.0.0.0:10000'));
});

test('local startup preserves dotenv fallback, port 8080 and safe missing-key behavior', () => {
  const local = startup({});
  assert.equal(local.key, 'local-fixture-only');
  assert.equal(local.port, 8080);
  assert.equal(local.host, '0.0.0.0');
  const missing = startup({ DATA_GO_KR_SERVICE_KEY: '' });
  assert.equal(missing.key, '');
  assert.equal(missing.warnings.length, 1);
  assert.equal(startup({}, 'YOUR_SERVICE_KEY_HERE').warnings.length, 1);
});
