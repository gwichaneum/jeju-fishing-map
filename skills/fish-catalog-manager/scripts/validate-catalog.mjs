import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../../', import.meta.url));
const required = [
  'speciesId', 'nameKo', 'nameEn', 'category', 'imageSrc', 'imageAlt', 'mapSpeciesKey',
  'description', 'methods', 'rigs', 'seasonNote', 'habitatNote', 'sourceUrl', 'license',
  'attribution', 'verified', 'needsVerification', 'imageSourceUrl', 'imageLicense',
  'imageAttribution', 'imageVerified',
];
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const httpUrl = value => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); }
  catch { return false; }
};
const isWithin = (base, target) => {
  const relative = path.relative(base, target);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
};

export function loadMapSpecies(root = projectRoot) {
  const context = vm.createContext({});
  for (const file of ['fishing-spots.js', 'spot-filters.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file, timeout: 3000 });
  }
  return new Set(vm.runInContext('createSpotFilterOptions(fishingSpots).species', context));
}

export function validateCatalog(catalog, { root = projectRoot, mapKeys = loadMapSpecies(root), minSpecies = 20 } = {}) {
  const errors = [];
  const warnings = [];
  const error = message => errors.push(message);
  const warn = message => warnings.push(message);
  if (!Array.isArray(catalog)) return { errors: ['Catalog must be an array.'], warnings };
  if (catalog.length < minSpecies) error(`Expected at least ${minSpecies} species; got ${catalog.length}.`);
  const ids = new Set();
  const names = new Set();
  const images = new Set();
  catalog.forEach((item, index) => {
    const label = `[${index}] ${item?.speciesId || '(no ID)'}`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) { error(`${label}: expected object.`); return; }
    for (const key of required) if (!Object.hasOwn(item, key)) error(`${label}: missing ${key}.`);
    if (!nonempty(item.speciesId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.speciesId)) error(`${label}: invalid speciesId.`);
    if (ids.has(item.speciesId)) error(`${label}: duplicate speciesId.`);
    ids.add(item.speciesId);
    if (!nonempty(item.nameKo)) error(`${label}: nameKo is required.`);
    if (names.has(item.nameKo)) error(`${label}: duplicate nameKo; review identity.`);
    names.add(item.nameKo);
    if (!['fish', 'cephalopod'].includes(item.category)) error(`${label}: invalid category.`);
    if (!nonempty(item.imageAlt)) error(`${label}: imageAlt is required.`);
    for (const key of ['verified', 'needsVerification', 'imageVerified']) {
      if (typeof item[key] !== 'boolean') error(`${label}: ${key} must be boolean.`);
    }
    for (const key of ['methods', 'rigs']) {
      if (!Array.isArray(item[key]) || !item[key].every(nonempty)) error(`${label}: ${key} must be nonempty-string array (empty allowed when unverified).`);
    }
    for (const key of ['nameEn', 'description', 'seasonNote', 'habitatNote', 'license', 'attribution', 'imageLicense', 'imageAttribution', 'scientificName']) {
      if (Object.hasOwn(item, key) && item[key] !== null && !nonempty(item[key])) error(`${label}: ${key} must be nonempty string or null.`);
    }
    for (const key of ['sourceUrl', 'imageSourceUrl']) {
      if (item[key] !== null && !httpUrl(item[key])) error(`${label}: ${key} must be HTTP(S) URL or null.`);
    }
    if (item.mapSpeciesKey !== null && !mapKeys.has(item.mapSpeciesKey)) error(`${label}: mapSpeciesKey is not an actual map filter option.`);
    if ((item.needsVerification === true || item.mapSpeciesKey === null) && !nonempty(item.verificationNote)) error(`${label}: verificationNote is required.`);
    if (item.verified === false || item.imageVerified === false || item.mapSpeciesKey === null) {
      if (item.needsVerification !== true) error(`${label}: pending information/image/map key requires needsVerification=true.`);
    }
    if (item.verified === true) {
      for (const key of ['description', 'seasonNote', 'habitatNote', 'sourceUrl', 'license', 'attribution']) {
        if (!nonempty(item[key])) error(`${label}: verified information requires ${key}.`);
      }
      for (const key of ['methods', 'rigs']) if (!item[key]?.length) error(`${label}: verified information requires ${key}.`);
    }
    if (item.needsVerification === true) warn(`${label}: needs verification: ${item.verificationNote || 'reason missing'}`);
    if (item.imageSrc === null) {
      warn(`${label}: image not prepared.`);
      if (item.imageVerified !== false || item.needsVerification !== true) error(`${label}: missing image requires imageVerified=false and needsVerification=true.`);
    } else if (!nonempty(item.imageSrc)) {
      error(`${label}: imageSrc must be a local assets path or null.`);
    } else {
      const src = item.imageSrc.replace(/^\.\//, '');
      const target = path.resolve(root, src);
      const assetsRoot = path.resolve(root, 'assets');
      if (!src.startsWith('assets/') || src.includes('\\') || /[?#]/.test(src) || !isWithin(assetsRoot, target) || !/\.(png|webp|svg)$/i.test(src)) {
        error(`${label}: image must be PNG/WebP/SVG within local assets/.`);
      } else if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        error(`${label}: image file does not exist.`);
      } else if (!isWithin(fs.realpathSync(assetsRoot), fs.realpathSync(target))) {
        error(`${label}: image resolves outside assets/.`);
      }
      if (images.has(target)) error(`${label}: image path reused across species.`);
      images.add(target);
      if (item.imageVerified !== true) error(`${label}: unverified image must not be used; set imageSrc=null until reviewed.`);
      for (const key of ['imageSourceUrl', 'imageLicense', 'imageAttribution']) if (!nonempty(item[key])) error(`${label}: image requires ${key}.`);
    }
    // One source per species; rendering state must use CSS, never a second asset.
    for (const key of ['lockedImageSrc', 'unlockedImageSrc']) {
      if (Object.hasOwn(item, key) && item[key] !== item.imageSrc) error(`${label}: ${key} differs from imageSrc.`);
    }
  });
  return { errors, warnings };
}

function selfTest() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'jeju-catalog-validator-'));
  try {
    fs.mkdirSync(path.join(tempRoot, 'assets'));
    fs.writeFileSync(path.join(tempRoot, 'assets', 'fixture.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    const fixture = {
      speciesId: 'fixture-a', nameKo: '검증기 전용', nameEn: null, category: 'fish',
      imageSrc: 'assets/fixture.svg', imageAlt: '검증기 전용', mapSpeciesKey: '테스트키',
      description: 'Fixture only', methods: ['fixture'], rigs: ['fixture'], seasonNote: 'fixture', habitatNote: 'fixture',
      sourceUrl: 'https://example.org/info', license: 'fixture', attribution: 'fixture', verified: true,
      needsVerification: false, imageSourceUrl: 'https://example.org/image', imageLicense: 'fixture',
      imageAttribution: 'fixture', imageVerified: true,
    };
    const check = data => validateCatalog(data, { root: tempRoot, mapKeys: new Set(['테스트키']), minSpecies: 1 });
    assert.deepEqual(check([fixture]), { errors: [], warnings: [] });
    const cases = [
      ['duplicate', [fixture, fixture]],
      ['missing field', [{ ...fixture, imageAlt: '' }]],
      ['invalid category', [{ ...fixture, category: 'other' }]],
      ['unknown map key', [{ ...fixture, mapSpeciesKey: 'unknown' }]],
      ['hotlink', [{ ...fixture, imageSrc: 'https://example.org/x.png' }]],
      ['missing image', [{ ...fixture, imageSrc: 'assets/absent.png' }]],
      ['path traversal', [{ ...fixture, imageSrc: 'assets/../../x.png' }]],
      ['missing source', [{ ...fixture, sourceUrl: null }]],
      ['unverified asset', [{ ...fixture, imageVerified: false }]],
      ['different locked image', [{ ...fixture, lockedImageSrc: 'assets/other.png' }]],
      ['malformed row', [null]],
    ];
    for (const [label, data] of cases) assert.ok(check(data).errors.length > 0, label);
    const pending = { ...fixture, imageSrc: null, imageVerified: false, verified: false, sourceUrl: null,
      license: null, attribution: null, description: null, methods: [], rigs: [], seasonNote: null, habitatNote: null,
      needsVerification: true, verificationNote: 'Fixture pending' };
    assert.equal(check([pending]).errors.length, 0);
    assert.equal(check([pending]).warnings.length, 2);
    assert.ok(validateCatalog([], { root: tempRoot, mapKeys: new Set() }).errors.length > 0);
    console.log(`PASS validator self-test: valid/pending fixtures and ${cases.length} invalid cases. No app data tested.`);
  } finally {
    const expectedParent = fs.realpathSync(os.tmpdir());
    const resolved = fs.realpathSync(tempRoot);
    if (path.dirname(resolved) !== expectedParent || !path.basename(resolved).startsWith('jeju-catalog-validator-')) {
      throw new Error('Refusing cleanup outside the validator temporary directory.');
    }
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--self-test') { selfTest(); return; }
  let input;
  let strict = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--catalog' && args[index + 1] && !args[index + 1].startsWith('--')) input = args[++index];
    else if (args[index] === '--strict') strict = true;
    else throw new Error('Usage: validate-catalog.mjs [--catalog actual.json] [--strict] | --self-test');
  }
  if (!input) { console.log('SKIP catalog: no --catalog supplied; app catalog is not validated.'); return; }
  const data = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8').replace(/^\uFEFF/, ''));
  const result = validateCatalog(Array.isArray(data) ? data : data.speciesCatalog);
  for (const message of result.errors) console.error(`ERROR ${message}`);
  for (const message of result.warnings) console.warn(`WARN ${message}`);
  const failed = result.errors.length > 0 || (strict && result.warnings.length > 0);
  console.log(`${failed ? 'FAIL' : 'PASS'} catalog structure: ${result.errors.length} errors, ${result.warnings.length} pending warnings. Image identity/rights require manual review.`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`FAIL catalog validator: ${error.message}`); process.exitCode = 1; }
}
