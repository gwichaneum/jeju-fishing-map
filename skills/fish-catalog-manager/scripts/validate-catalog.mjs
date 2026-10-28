import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../../', import.meta.url));
const required = [
  'speciesId', 'nameKo', 'nameEn', 'category', 'imageSrc', 'imageAlt', 'mapSpeciesKey',
  'description', 'methods', 'rigs', 'seasonNote', 'habitatNote', 'sourceUrl', 'license',
  'attribution', 'verified', 'needsVerification', 'imageSourceUrl', 'imageLicense',
  'imageAttribution', 'imageVerified', 'needsAsset', 'informationSources',
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

export function validateCatalog(catalog, { root = projectRoot, mapKeys = loadMapSpecies(root), minSpecies = 30 } = {}) {
  const errors = [];
  const warnings = [];
  const error = message => errors.push(message);
  const warn = message => warnings.push(message);
  if (!Array.isArray(catalog)) return { errors: ['Catalog must be an array.'], warnings };
  if (catalog.length < minSpecies) error(`Expected at least ${minSpecies} species; got ${catalog.length}.`);
  const ids = new Set();
  const names = new Set();
  const images = new Set();
  const hashes = new Set();
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
    for (const key of ['verified', 'needsVerification', 'imageVerified', 'needsAsset']) {
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
    if (item.needsAsset !== false) error(`${label}: needsAsset must be false for Phase 2 asset acceptance.`);
    if (item.mapSpeciesKey !== null && !nonempty(item.mapSpeciesKey)) error(`${label}: mapSpeciesKey must be a nonempty string or null.`);
    else if (item.mapSpeciesKey !== null && !mapKeys.has(item.mapSpeciesKey)) error(`${label}: mapSpeciesKey is not an actual map filter option.`);
    if (Object.hasOwn(item, 'mapMatchStatus') && !['matched', 'unavailable', 'pending'].includes(item.mapMatchStatus)) error(`${label}: invalid mapMatchStatus.`);
    if (item.mapMatchStatus === 'unavailable' && item.mapSpeciesKey !== null) error(`${label}: unavailable map match requires a null key.`);
    if (item.mapMatchStatus === 'matched' && item.mapSpeciesKey === null) error(`${label}: matched map status requires an actual key.`);
    if ((item.needsVerification === true || item.mapSpeciesKey === null) && !nonempty(item.verificationNote)) error(`${label}: verificationNote is required.`);
    const pendingMap = item.mapSpeciesKey === null && item.mapMatchStatus !== 'unavailable' || item.mapMatchStatus === 'pending';
    if (item.verified === false || item.imageVerified === false || pendingMap) {
      if (item.needsVerification !== true) error(`${label}: pending information/image/map key requires needsVerification=true.`);
    }
    if (item.verified === true && item.imageVerified === true && !pendingMap && item.needsVerification === true) {
      error(`${label}: reviewed information/image/map status contradicts needsVerification=true; identify the pending information with verified=false.`);
    }
    const guideFields = ['description', 'methods', 'rigs', 'seasonNote', 'habitatNote'];
    const infoSources = Array.isArray(item.informationSources) ? item.informationSources : [];
    if (!Array.isArray(item.informationSources) || !infoSources.every(source => source && nonempty(source.title)
      && httpUrl(source.url) && Array.isArray(source.fields) && source.fields.length && source.fields.every(nonempty)
      && /^\d{4}-\d{2}-\d{2}$/.test(source.reviewedOn))) error(`${label}: informationSources requires title, HTTP(S) url, fields and reviewedOn.`);
    if (item.verified === true) {
      for (const key of ['description', 'seasonNote', 'habitatNote', 'sourceUrl', 'license', 'attribution']) {
        if (!nonempty(item[key])) error(`${label}: verified information requires ${key}.`);
      }
      for (const key of ['methods', 'rigs']) if (!item[key]?.length) error(`${label}: verified information requires ${key}.`);
      for (const key of guideFields) {
        if (!infoSources.some(source => Array.isArray(source?.fields) && source.fields.includes(key) && !source.fields.some(field => /^image/.test(field)))) {
          error(`${label}: verified ${key} needs an information source separate from image provenance.`);
        }
      }
      if (!infoSources.some(source => source?.url === item.sourceUrl && Array.isArray(source.fields) && !source.fields.some(field => /^image/.test(field)))) error(`${label}: sourceUrl must reference a recorded information source.`);
    }
    if (item.needsVerification === true) {
      const missing = guideFields.filter(key => Array.isArray(item[key]) ? !item[key].length : !nonempty(item[key]));
      warn(`${label}: needs verification${missing.length ? ` (missing: ${missing.join(', ')})` : ''}: ${item.verificationNote || 'reason missing'}`);
    }
    if (item.imageSrc === null) {
      error(`${label}: every species requires a local imageSrc.`);
      warn(`${label}: image not prepared.`);
      if (item.imageVerified !== false || item.needsVerification !== true || item.needsAsset !== true || !nonempty(item.assetNote)) error(`${label}: missing image requires imageVerified=false, needsAsset=true, needsVerification=true and assetNote.`);
    } else if (!nonempty(item.imageSrc)) {
      error(`${label}: imageSrc must be a local assets path or null.`);
    } else {
      const src = item.imageSrc.replace(/^\.\//, '');
      const target = path.resolve(root, src);
      const assetsRoot = path.resolve(root, 'assets');
      if (/placeholder|pending|generic|준비/i.test(src)) error(`${label}: placeholder image path is forbidden.`);
      if (!/^assets\/species\/[a-z0-9-]+\.(?:png|webp|svg|jpe?g)$/.test(src) || src.includes('\\') || /[?#]/.test(src) || !isWithin(assetsRoot, target)) {
        error(`${label}: image must be PNG/WebP/SVG/JPEG within local assets/.`);
      } else if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        error(`${label}: image file does not exist.`);
      } else if (!isWithin(fs.realpathSync(assetsRoot), fs.realpathSync(target))) {
        error(`${label}: image resolves outside assets/.`);
      } else {
        const bytes = fs.readFileSync(target);
        if (!bytes.length) error(`${label}: image file is empty.`);
        const ext = path.extname(src);
        const validBytes = ext === '.webp' ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
          : ext === '.png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : ext === '.svg' ? /<svg[\s>]/.test(bytes.toString('utf8')) : bytes[0] === 255 && bytes[1] === 216;
        if (!validBytes) error(`${label}: image bytes do not match the extension.`);
        const hash = crypto.createHash('sha256').update(bytes).digest('hex');
        if (hashes.has(hash)) error(`${label}: identical image bytes reused across species.`);
        hashes.add(hash);
        if (item.imageSha256 && item.imageSha256 !== hash) error(`${label}: image SHA-256 mismatch.`);
        if (/\.svg$/i.test(src) && /<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|javascript:)|url\(\s*["']?https?:/i.test(bytes.toString('utf8'))) error(`${label}: SVG contains active or external content.`);
      }
      if (path.basename(src, path.extname(src)) !== item.speciesId) error(`${label}: image filename must match speciesId.`);
      if (images.has(target)) error(`${label}: image path reused across species.`);
      images.add(target);
      if (item.imageVerified !== true) error(`${label}: unverified image must not be used; set imageSrc=null until reviewed.`);
      if (item.needsAsset !== false || item.imageQualityVerified !== true || !['transparent', 'solid'].includes(item.imageBackground)) error(`${label}: prepared image requires needsAsset=false and reviewed full-body/clean-background quality.`);
      for (const key of ['imageSourceUrl', 'imageLicense', 'imageAttribution']) if (!nonempty(item[key])) error(`${label}: image requires ${key}.`);
    }
    for (const [key, min, max] of [['imageScale', 0.25, 1.5], ['imageRotation', -180, 180]]) {
      if (Object.hasOwn(item, key) && (!Number.isFinite(item[key]) || item[key] < min || item[key] > max)) error(`${label}: invalid ${key}.`);
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
    fs.mkdirSync(path.join(tempRoot, 'assets', 'species'), { recursive: true });
    fs.writeFileSync(path.join(tempRoot, 'assets', 'species', 'fixture-a.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    fs.writeFileSync(path.join(tempRoot, 'assets', 'species', 'fixture-b.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    fs.writeFileSync(path.join(tempRoot, 'assets', 'species', 'empty.svg'), '');
    const fixture = {
      speciesId: 'fixture-a', nameKo: '검증기 전용', nameEn: null, category: 'fish',
      imageSrc: 'assets/species/fixture-a.svg', imageAlt: '검증기 전용', mapSpeciesKey: '테스트키',
      description: 'Fixture only', methods: ['fixture'], rigs: ['fixture'], seasonNote: 'fixture', habitatNote: 'fixture',
      sourceUrl: 'https://example.org/info', license: 'fixture', attribution: 'fixture', verified: true,
      needsVerification: false, imageSourceUrl: 'https://example.org/image', imageLicense: 'fixture',
      imageAttribution: 'fixture', imageVerified: true, needsAsset: false, imageQualityVerified: true, imageBackground: 'transparent',
      informationSources: [{ url: 'https://example.org/info', title: 'Fixture source', fields: ['description', 'methods', 'rigs', 'seasonNote', 'habitatNote'], reviewedOn: '2026-10-28' }],
    };
    const check = data => validateCatalog(data, { root: tempRoot, mapKeys: new Set(['테스트키']), minSpecies: 1 });
    assert.deepEqual(check([fixture]), { errors: [], warnings: [] });
    assert.deepEqual(check([{ ...fixture, mapSpeciesKey: null, mapMatchStatus: 'unavailable', verificationNote: 'Reviewed: no corresponding filter.' }]), { errors: [], warnings: [] });
    const unknownInfo = { ...fixture, verified: false, needsVerification: true, verificationNote: 'Information not yet confirmed',
      sourceUrl: null, license: null, attribution: null, description: null, methods: [], rigs: [], seasonNote: null, habitatNote: null, informationSources: [] };
    assert.equal(check([unknownInfo]).errors.length, 0, 'honest unknown information remains structurally valid');
    assert.equal(check([unknownInfo]).warnings.length, 1, 'strict acceptance must retain a pending information warning');
    const cases = [
      ['duplicate', [fixture, fixture]],
      ['identical bytes in distinct files', [fixture, { ...fixture, speciesId: 'fixture-b', nameKo: '다른 종', imageSrc: 'assets/species/fixture-b.svg' }]],
      ['pending asset flag', [{ ...fixture, needsAsset: true }]],
      ['missing field', [{ ...fixture, imageAlt: '' }]],
      ['invalid category', [{ ...fixture, category: 'other' }]],
      ['unknown map key', [{ ...fixture, mapSpeciesKey: 'unknown' }]],
      ['non-string map key', [{ ...fixture, mapSpeciesKey: 123 }]],
      ['unreviewed null map key', [{ ...fixture, mapSpeciesKey: null, verificationNote: 'Not reviewed' }]],
      ['unavailable with key', [{ ...fixture, mapMatchStatus: 'unavailable' }]],
      ['matched without key', [{ ...fixture, mapSpeciesKey: null, mapMatchStatus: 'matched', verificationNote: 'Invalid' }]],
      ['unavailable without reason', [{ ...fixture, mapSpeciesKey: null, mapMatchStatus: 'unavailable' }]],
      ['invalid match status', [{ ...fixture, mapMatchStatus: 'invented' }]],
      ['hotlink', [{ ...fixture, imageSrc: 'https://example.org/x.png' }]],
      ['missing image', [{ ...fixture, imageSrc: 'assets/species/absent.png' }]],
      ['empty image', [{ ...fixture, speciesId: 'empty', imageSrc: 'assets/species/empty.svg' }]],
      ['wrong filename', [{ ...fixture, speciesId: 'different' }]],
      ['unreviewed quality', [{ ...fixture, imageQualityVerified: false }]],
      ['bad scale', [{ ...fixture, imageScale: Infinity }]],
      ['path traversal', [{ ...fixture, imageSrc: 'assets/../../x.png' }]],
      ['missing source', [{ ...fixture, sourceUrl: null }]],
      ['verified missing methods', [{ ...fixture, methods: [] }]],
      ['verified missing rigs', [{ ...fixture, rigs: [] }]],
      ['verified missing description', [{ ...fixture, description: null }]],
      ['unverified without pending flag', [{ ...fixture, verified: false }]],
      ['reviewed with pending flag', [{ ...fixture, needsVerification: true, verificationNote: 'Conflicting flags' }]],
      ['missing method evidence', [{ ...fixture, informationSources: [{ ...fixture.informationSources[0], fields: ['description', 'rigs', 'seasonNote', 'habitatNote'] }] }]],
      ['image is not method evidence', [{ ...fixture, informationSources: [{ ...fixture.informationSources[0], fields: [...fixture.informationSources[0].fields, 'image'] }] }]],
      ['unsafe information URL', [{ ...fixture, informationSources: [{ ...fixture.informationSources[0], url: 'javascript:alert(1)' }] }]],
      ['malformed evidence fields', [{ ...fixture, informationSources: [{ ...fixture.informationSources[0], fields: 'methods' }] }]],
      ['unverified asset', [{ ...fixture, imageVerified: false }]],
      ['different locked image', [{ ...fixture, lockedImageSrc: 'assets/other.png' }]],
      ['malformed row', [null]],
    ];
    for (const [label, data] of cases) assert.ok(check(data).errors.length > 0, label);
    const pending = { ...fixture, imageSrc: null, imageVerified: false, verified: false, sourceUrl: null,
      license: null, attribution: null, description: null, methods: [], rigs: [], seasonNote: null, habitatNote: null,
      needsVerification: true, verificationNote: 'Fixture pending', needsAsset: true, assetNote: 'Fixture image pending' };
    assert.ok(check([pending]).errors.length > 0, 'pending assets must fail final asset acceptance');
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
