import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const skillResources = {
  'fish-catalog-manager': ['references/species-schema.md', 'references/image-source-policy.md', 'scripts/validate-catalog.mjs'],
  'catch-record-manager': ['references/indexeddb-schema.md', 'scripts/validate-record-logic.mjs'],
  'map-catalog-integrator': ['references/integration-contract.md'],
  'fishing-app-tester': ['references/test-cases.md', 'scripts/run-static-checks.mjs'],
};

export function validateFrontmatter(source, folderName) {
  const errors = [];
  if (!source.startsWith('---\n') && !source.startsWith('---\r\n')) return ['First line must be exactly --- without BOM.'];
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) return ['Missing closing frontmatter delimiter or Markdown body.'];
  // These project skills use simple unquoted single-line YAML scalars only.
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(name|description): (.+)$/);
    if (!field) { errors.push('Expected single-line name/description YAML scalar.'); continue; }
    if (Object.hasOwn(fields, field[1])) errors.push(`Duplicate ${field[1]}.`);
    fields[field[1]] = field[2];
    if (field[2].includes(': ') || /\s#/.test(field[2])) errors.push('Quote YAML special values or keep project scalars simple.');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name || '') || fields.name?.length >= 64) errors.push('Invalid skill name.');
  if (fields.name !== folderName) errors.push('Skill name differs from folder name.');
  if (!fields.description || fields.description.length < 30 || !fields.description.includes('사용')) errors.push('Description must explain capability and when to use it.');
  if (source.split(/\r?\n/).length >= 500 || source.length > 18000) errors.push('SKILL.md exceeds the concise entrypoint budget.');
  if (!match[2].trim().startsWith('#')) errors.push('Expected Markdown body.');
  return errors;
}

function selfTest() {
  const valid = '---\nname: fixture-skill\ndescription: 제주 낚시 도감 데이터를 검증하고 어종 정보 수정 요청 시 사용합니다.\n---\n# Fixture\n';
  assert.deepEqual(validateFrontmatter(valid, 'fixture-skill'), []);
  for (const invalid of [
    '\uFEFF' + valid, valid.replace('---\n#', '#'), valid.replace('fixture-skill', 'Bad_Name'),
    valid.replace('description:', 'unknown:'), valid.replace('name: fixture-skill', 'name: another-skill'),
  ]) assert.ok(validateFrontmatter(invalid, 'fixture-skill').length > 0);
  console.log('PASS static validator self-test: valid frontmatter and 5 invalid cases.');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--self-test') { selfTest(); return; }
  const options = { phase: 1 };
  for (let index = 0; index < args.length; index++) {
    if (/^--phase=[1-5]$/.test(args[index])) options.phase = Number(args[index].split('=')[1]);
    else if (['--catalog', '--record-module'].includes(args[index]) && args[index + 1] && !args[index + 1].startsWith('--')) options[args[index].slice(2)] = args[++index];
    else throw new Error('Usage: run-static-checks.mjs --phase=1..5 [--catalog actual.json] [--record-module actual.cjs] | --self-test');
  }
  let passed = 0;
  let failed = 0;
  const check = (label, action) => {
    try { action(); passed++; console.log(`PASS ${label}`); }
    catch (error) { failed++; console.error(`FAIL ${label}: ${error.message}`); }
  };
  const runNode = (script, params = []) => {
    const result = spawnSync(process.execPath, [script, ...params], { cwd: root, encoding: 'utf8', timeout: 30000, windowsHide: true });
    if (result.stdout?.trim()) console.log(result.stdout.trim());
    if (result.stderr?.trim()) console.error(result.stderr.trim());
    assert.equal(result.status, 0, result.error?.message || `Node command exited ${result.status}`);
  };
  const markdown = ['PRD.md', 'TODO.md', 'docs/SKILL_USAGE.md'];
  for (const [name, resources] of Object.entries(skillResources)) {
    const base = path.join('skills', name);
    const entry = path.join(base, 'SKILL.md');
    check(`${name} frontmatter`, () => {
      const errors = validateFrontmatter(fs.readFileSync(path.join(root, entry), 'utf8'), name);
      assert.deepEqual(errors, []);
    });
    markdown.push(entry);
    for (const resource of resources) {
      const file = path.join(base, resource);
      check(`${name}/${resource} exists`, () => assert.ok(fs.statSync(path.join(root, file)).size > 0));
      if (resource.endsWith('.md')) markdown.push(file);
    }
  }
  for (const file of markdown) {
    check(`local links ${file}`, () => {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const link = match[1].replace(/^<|>$/g, '');
        if (/^(https?:|mailto:|#)/.test(link)) continue;
        const target = decodeURIComponent(link.split('#')[0]);
        assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), target)), `Missing link ${target}`);
      }
    });
  }
  const codeFiles = [];
  const collectCode = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory() && ['server', 'tests', 'skills', ...Object.keys(skillResources), 'scripts'].includes(entry.name)) collectCode(file);
      if (entry.isFile() && /\.(js|cjs|mjs)$/.test(entry.name)) codeFiles.push(file);
    }
  };
  collectCode(root);
  check(`JavaScript syntax (${codeFiles.length} files)`, () => {
    for (const file of codeFiles) runNode('--check', [file]);
  });
  check('index.html local resources', () => {
    const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    for (const match of source.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)) assert.ok(fs.existsSync(path.resolve(root, match[1])), `Missing ${match[1]}`);
  });
  check('secret/dependency Git exclusions (paths only)', () => {
    const tracked = spawnSync('git', ['ls-files', '--', '.env', '.env.*', 'node_modules'], { cwd: root, encoding: 'utf8', windowsHide: true });
    assert.equal(tracked.status, 0, 'git ls-files failed');
    const forbidden = tracked.stdout.trim().split(/\r?\n/).filter(file => file && file !== '.env.example');
    assert.equal(forbidden.length, 0, 'Secret/dependency paths are tracked.');
    for (const name of ['.env', 'node_modules/']) {
      const ignored = spawnSync('git', ['check-ignore', '-q', name], { cwd: root, windowsHide: true });
      assert.equal(ignored.status, 0, `${name} is not ignored`);
    }
  });
  if (options.catalog) {
    check('actual catalog', () => runNode(path.join(root, 'skills/fish-catalog-manager/scripts/validate-catalog.mjs'), ['--catalog', path.resolve(options.catalog), '--strict']));
  } else if (options.phase >= 2) check('actual catalog required', () => assert.fail('Supply --catalog with the actual exported catalog JSON.'));
  else console.log('SKIP actual catalog: Phase 1 has no species catalog/images.');
  if (options['record-module']) {
    check('actual record logic', () => runNode(path.join(root, 'skills/catch-record-manager/scripts/validate-record-logic.mjs'), ['--module', path.resolve(options['record-module'])]));
  } else if (options.phase >= 3) check('actual record module required', () => assert.fail('Supply --record-module with the actual implementation.'));
  else console.log('SKIP actual record logic/IndexedDB: not implemented in this phase.');
  console.log('MANUAL: browser T01-T14, image identity/rights, IndexedDB persistence, live APIs and deployment are not covered by static checks.');
  console.log(`Static checks: ${passed} passed, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`FAIL static checks: ${error.message}`); process.exitCode = 1; }
}
