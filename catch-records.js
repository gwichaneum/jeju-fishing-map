(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CatchRecords = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const DB_NAME = 'jejuFishingCollection';
  const DB_VERSION = 3;
  const STORE_NAME = 'catchRecords';
  const CUSTOM_STORE_NAME = 'customLocations';
  const ACHIEVEMENT_STORE_NAME = 'achievementUnlocks';
  const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
  const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;

  class CatchRecordError extends Error {
    constructor(code, message) { super(message || code); this.name = 'CatchRecordError'; this.code = code; }
  }

  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validTimestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && date.toISOString() === value;
  }

  function parseCount(value) {
    if (typeof value === 'string') {
      if (!/^\d+$/.test(value.trim())) return NaN;
      value = Number(value.trim());
    }
    return Number.isSafeInteger(value) && value > 0 ? value : NaN;
  }

  function photoError(blob) {
    if (!(blob instanceof Blob) || !PHOTO_TYPES.includes(blob.type)) return 'JPEG, PNG, WebP 사진을 선택해 주세요. HEIC/HEIF는 변환 후 선택해 주세요.';
    if (!blob.size) return '내용이 없는 사진은 저장할 수 없습니다.';
    if (blob.size > MAX_PHOTO_BYTES) return '사진은 10MiB 이하로 선택해 주세요. 큰 사진은 크기를 줄인 뒤 다시 선택해 주세요.';
    return '';
  }

  async function inspectPhoto(blob) {
    const error = photoError(blob);
    if (error) throw new CatchRecordError('PHOTO', error);
    const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    const isPng = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte);
    const isJpeg = header[0] === 255 && header[1] === 216 && header[2] === 255;
    const isWebp = String.fromCharCode(...header.slice(0, 4)) === 'RIFF' && String.fromCharCode(...header.slice(8, 12)) === 'WEBP';
    if (!(blob.type === 'image/png' && isPng || blob.type === 'image/jpeg' && isJpeg || blob.type === 'image/webp' && isWebp)) {
      throw new CatchRecordError('PHOTO', '파일 내용이 사진 형식과 일치하지 않습니다. 다른 JPEG, PNG, WebP 사진을 선택해 주세요.');
    }
    const url = URL.createObjectURL(blob);
    const img = new Image();
    let timer;
    try {
      const loaded = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new CatchRecordError('PHOTO', '사진을 표시할 수 없습니다. 손상되지 않은 JPEG, PNG, WebP 사진을 선택해 주세요.'));
        timer = setTimeout(() => reject(new CatchRecordError('PHOTO', '사진 확인에 시간이 오래 걸립니다. 더 작은 사진으로 다시 시도해 주세요.')), 15000);
      });
      img.src = url;
      await loaded;
      if (typeof img.decode === 'function') await img.decode();
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('Invalid image dimensions');
      return { width: img.naturalWidth, height: img.naturalHeight };
    } catch (error) {
      if (error instanceof CatchRecordError) throw error;
      throw new CatchRecordError('PHOTO', '사진을 표시할 수 없습니다. 다른 사진을 선택해 주세요.');
    } finally {
      clearTimeout(timer);
      img.onload = img.onerror = null;
      img.removeAttribute('src');
      URL.revokeObjectURL(url);
    }
  }

  function validateCatchRecord(record, speciesIds, mapSpotIds = []) {
    const errors = [];
    if (!record || typeof record !== 'object' || Array.isArray(record)) return { valid: false, errors: ['올바른 조과 기록이 아닙니다.'] };
    if (!nonempty(record.recordId)) errors.push('기록 ID가 필요합니다.');
    if (!Array.isArray(speciesIds) || !speciesIds.includes(record.speciesId)) errors.push('도감에 없는 어종입니다.');
    if (!validDate(record.caughtAt)) errors.push('잡은 날짜를 올바르게 입력해 주세요.');
    else if (record.caughtAt > localDate()) errors.push('잡은 날짜는 오늘 또는 이전 날짜로 입력해 주세요.');
    if (!Number.isSafeInteger(record.count) || record.count <= 0) errors.push('잡은 마릿수는 1마리 이상의 정수로 입력해 주세요.');
    const photoIssue = photoError(record.photoBlob);
    if (photoIssue) errors.push(photoIssue);
    if (!nonempty(record.photoName)) errors.push('사진 파일명이 필요합니다.');
    if (record.photoType !== record.photoBlob?.type) errors.push('사진 형식 정보가 일치하지 않습니다.');
    if (record.mapSpotId != null && (!Number.isSafeInteger(record.mapSpotId)
      || Array.isArray(mapSpotIds) && !mapSpotIds.includes(record.mapSpotId))) errors.push('존재하지 않는 지도 포인트입니다.');
    if (record.customLocationId != null && (!nonempty(record.customLocationId) || record.customLocationId.length > 120)) errors.push('사용자 장소 ID가 올바르지 않습니다.');
    if (record.mapSpotId != null && record.customLocationId != null) errors.push('장소는 하나만 선택해 주세요.');
    if (typeof record.locationName !== 'string' || record.locationName.length > 120) errors.push('장소는 120자 이내로 입력해 주세요.');
    if (typeof record.memo !== 'string' || record.memo.length > 2000) errors.push('메모는 2,000자 이내로 입력해 주세요.');
    if (!validTimestamp(record.createdAt) || !validTimestamp(record.updatedAt)) errors.push('기록 시각이 올바르지 않습니다.');
    else if (record.updatedAt < record.createdAt) errors.push('수정 시각이 생성 시각보다 이릅니다.');
    return { valid: errors.length === 0, errors };
  }

  function summarizeCollection(records, speciesIds, mapSpotIds = null) {
    const ids = [...new Set(Array.isArray(speciesIds) ? speciesIds : [])];
    const bySpecies = Object.fromEntries(ids.map(id => [id, { totalCount: 0, recordCount: 0, collected: false, firstCaughtAt: null, lastCaughtAt: null }]));
    const seen = new Set();
    for (const record of Array.isArray(records) ? records : []) {
      if (!validateCatchRecord(record, ids, mapSpotIds).valid || seen.has(record.recordId)) continue;
      seen.add(record.recordId);
      const summary = bySpecies[record.speciesId];
      summary.totalCount += record.count;
      summary.recordCount++;
      summary.collected = true;
      if (summary.firstCaughtAt === null || record.caughtAt < summary.firstCaughtAt) summary.firstCaughtAt = record.caughtAt;
      if (summary.lastCaughtAt === null || record.caughtAt > summary.lastCaughtAt) summary.lastCaughtAt = record.caughtAt;
    }
    const collectedSpecies = Object.values(bySpecies).filter(item => item.collected).length;
    return { bySpecies, collectedSpecies, totalSpecies: ids.length, progress: ids.length ? collectedSpecies / ids.length * 100 : 0 };
  }

  function sortRecords(records) {
    return [...records].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt)
      || b.createdAt.localeCompare(a.createdAt) || a.recordId.localeCompare(b.recordId));
  }

  function createRecordId(cryptoApi = globalThis.crypto) {
    if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();
    if (typeof cryptoApi?.getRandomValues !== 'function') throw new CatchRecordError('UNSUPPORTED', '이 브라우저에서 안전한 기록 ID를 만들 수 없습니다. 최신 브라우저로 접속해 주세요.');
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function searchLocations(mapSpots, customLocations, query, limit = 8) {
    const needle = String(query || '').trim().toLocaleLowerCase();
    if (!needle) return [];
    const matches = (row, fields) => fields.some(key => (Array.isArray(row[key]) ? row[key] : [row[key]])
      .some(value => typeof value === 'string' && value.toLocaleLowerCase().includes(needle)));
    const rows = [
      ...mapSpots.filter(row => matches(row, ['name', 'region', 'address', 'aliases']))
        .map(row => ({ ...row, source: 'map' })),
      ...customLocations.filter(row => matches(row, ['name', 'address']))
        .map(row => ({ ...row, source: 'custom' })),
    ];
    // Prefer an exact name, then a name match over a region/address match. Keep source order for ties.
    const rank = row => row.name.toLocaleLowerCase() === needle ? 0 : row.name.toLocaleLowerCase().includes(needle) ? 1 : 2;
    return rows.sort((a, b) => rank(a) - rank(b)).slice(0, limit);
  }

  function findDuplicateLocation(mapSpots, customLocations, name) {
    const exactName = name.trim();
    const spot = mapSpots.find(row => row.name === exactName);
    if (spot) return { ...spot, source: 'map' };
    const custom = customLocations.find(row => row.name === exactName);
    return custom ? { ...custom, source: 'custom' } : null;
  }

  function validateCustomLocation(location) {
    const errors = [];
    if (!location || !nonempty(location.customLocationId) || !nonempty(location.name) || location.name.length > 120) errors.push('장소 이름은 1~120자로 입력해 주세요.');
    if (!location) return { valid: false, errors };
    for (const [field, max, label] of [['address', 300, '주소'], ['memo', 2000, '메모']]) {
      if (typeof location[field] !== 'string' || location[field].length > max) errors.push(`${label}는 ${max}자 이내로 입력해 주세요.`);
    }
    for (const [field, max, label] of [['latitude', 90, '위도'], ['longitude', 180, '경도']]) {
      if (location[field] !== null && (typeof location[field] !== 'number' || !Number.isFinite(location[field]) || Math.abs(location[field]) > max)) errors.push(`${label}는 -${max}~${max} 사이의 숫자로 입력해 주세요.`);
    }
    if (!validTimestamp(location.createdAt) || !validTimestamp(location.updatedAt) || location.updatedAt < location.createdAt) errors.push('장소 등록 시각이 올바르지 않습니다.');
    return { valid: errors.length === 0, errors };
  }

  function storageErrorMessage(error) {
    if (['PHOTO', 'VALIDATION', 'DUPLICATE_MAP', 'DUPLICATE_CUSTOM'].includes(error?.code)) return error.message;
    if (error?.code === 'BLOCKED') return '기록 저장소를 준비하지 못했습니다. 이 도감을 연 다른 탭을 닫고 다시 시도해 주세요.';
    if (error?.name === 'QuotaExceededError') return '기록을 저장하지 못했습니다. 브라우저 저장 공간을 확인하거나 더 작은 사진으로 다시 시도해 주세요.';
    if (error?.name === 'VersionError' || error?.code === 'SCHEMA' || error?.code === 'VERSION_CHANGED') return '기록 저장소 버전이 변경되었습니다. 도감을 연 다른 탭을 닫고 페이지를 새로고침해 주세요.';
    if (error?.code === 'UNSUPPORTED') return error.message && error.message !== error.code
      ? error.message : '이 브라우저에서는 기록 저장소를 사용할 수 없습니다. 최신 브라우저의 일반 모드에서 접속해 주세요.';
    if (error?.code === 'NOT_FOUND') return '수정할 기록이 없습니다. 다른 탭에서 삭제되었는지 확인하고 기록을 다시 불러와 주세요.';
    if (error?.name === 'SecurityError' || error?.name === 'InvalidStateError') return '브라우저가 기록 저장소 접근을 허용하지 않았습니다. 브라우저 설정을 확인하고 다시 시도해 주세요.';
    return '기록을 처리하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.';
  }

  function upgradeSchema(db, transaction) {
    const store = db.objectStoreNames.contains(STORE_NAME)
      ? transaction.objectStore(STORE_NAME) : db.createObjectStore(STORE_NAME, { keyPath: 'recordId' });
    if (store.keyPath !== 'recordId') throw new CatchRecordError('SCHEMA');
    for (const key of ['speciesId', 'caughtAt', 'createdAt']) {
      if (!store.indexNames.contains(key)) store.createIndex(key, key, { unique: false });
    }
    const locations = db.objectStoreNames.contains(CUSTOM_STORE_NAME)
      ? transaction.objectStore(CUSTOM_STORE_NAME) : db.createObjectStore(CUSTOM_STORE_NAME, { keyPath: 'customLocationId' });
    if (locations.keyPath !== 'customLocationId') throw new CatchRecordError('SCHEMA');
    if (!locations.indexNames.contains('name')) locations.createIndex('name', 'name', { unique: true });
    const unlocks = db.objectStoreNames.contains(ACHIEVEMENT_STORE_NAME)
      ? transaction.objectStore(ACHIEVEMENT_STORE_NAME) : db.createObjectStore(ACHIEVEMENT_STORE_NAME, { keyPath: 'achievementId' });
    if (unlocks.keyPath !== 'achievementId') throw new CatchRecordError('SCHEMA');
  }

  function createCatchRecordStore({ speciesIds, mapSpots = [], mapSpotIds = mapSpots.map(spot => spot.id), indexedDB: factory = globalThis.indexedDB, onVersionChange = () => {} }) {
    // No catalog metadata, collection flags or photo URLs are persisted here.
    const validIds = [...speciesIds];
    const validSpotIds = [...mapSpotIds];
    let database = null;
    let opening = null;
    let generation = 0;

    function open() {
      if (database) return Promise.resolve(database);
      if (opening) return opening;
      if (!factory) return Promise.reject(new CatchRecordError('UNSUPPORTED'));
      const currentGeneration = generation;
      opening = new Promise((resolve, reject) => {
        let settled = false;
        let upgradeError = null;
        const request = factory.open(DB_NAME, DB_VERSION);
        const fail = error => { if (!settled) { settled = true; reject(error); } };
        request.onblocked = () => fail(new CatchRecordError('BLOCKED'));
        request.onupgradeneeded = () => {
          if (settled || generation !== currentGeneration) { request.transaction.abort(); return; }
          try { upgradeSchema(request.result, request.transaction); }
          catch (error) { upgradeError = error; request.transaction.abort(); }
        };
        request.onerror = () => fail(upgradeError || request.error);
        request.onsuccess = () => {
          const db = request.result;
          if (settled || generation !== currentGeneration) { db.close(); fail(new CatchRecordError('VERSION_CHANGED')); return; }
          if (![STORE_NAME, CUSTOM_STORE_NAME, ACHIEVEMENT_STORE_NAME].every(name => db.objectStoreNames.contains(name))) { db.close(); fail(new CatchRecordError('SCHEMA')); return; }
          database = db;
          db.onversionchange = () => {
            db.close();
            database = null;
            generation++;
            onVersionChange(new CatchRecordError('VERSION_CHANGED'));
          };
          db.onclose = () => { if (database === db) database = null; };
          settled = true;
          resolve(db);
        };
      }).finally(() => { opening = null; });
      return opening;
    }

    async function transact(mode, operate, storeNames = [STORE_NAME]) {
      const db = await open();
      return new Promise((resolve, reject) => {
        let result;
        let operationError = null;
        let transaction;
        try {
          transaction = db.transaction(storeNames, mode);
          transaction.oncomplete = () => resolve(result);
          transaction.onerror = () => {}; // abort owns the rejection; no personal data is logged.
          transaction.onabort = () => reject(operationError || transaction.error || new CatchRecordError('TRANSACTION'));
          operate(transaction.objectStore(storeNames[0]), value => { result = value; }, error => {
            operationError = error;
            transaction.abort();
          }, transaction);
        } catch (error) {
          if (transaction) { operationError = error; try { transaction.abort(); } catch { reject(error); } }
          else reject(error);
        }
      });
    }

    async function loadAll() {
      const snapshot = await transact('readonly', (store, done, _fail, transaction) => {
        const result = { rows: [], customLocations: [] };
        store.getAll().onsuccess = event => { result.rows = event.target.result; };
        transaction.objectStore(CUSTOM_STORE_NAME).getAll().onsuccess = event => { result.customLocations = event.target.result; };
        done(result);
      }, [STORE_NAME, CUSTOM_STORE_NAME]);
      const { rows } = snapshot;
      const records = [];
      let invalidCount = 0;
      let next = 0;
      // Decode stored Blobs as well, so corrupt photos cannot silently unlock a species.
      await Promise.all(Array.from({ length: Math.min(3, rows.length) }, async () => {
        while (next < rows.length) {
          const row = rows[next++];
          if (!validateCatchRecord(row, validIds, validSpotIds).valid) { invalidCount++; continue; }
          try { await inspectPhoto(row.photoBlob); records.push(row); }
          catch { invalidCount++; }
        }
      }));
      return { records: sortRecords(records), invalidCount,
        customLocations: snapshot.customLocations.filter(row => validateCustomLocation(row).valid) };
    }

    function ensureValid(record) {
      const result = validateCatchRecord(record, validIds, validSpotIds);
      if (!result.valid) throw new CatchRecordError('VALIDATION', result.errors.join(' '));
      return record;
    }

    function writeRecord(store, transaction, record, method, done, fail) {
      const write = () => {
        try { ensureValid(record); store[method](record); done(record); }
        catch (error) { fail(error); }
      };
      if (record.mapSpotId != null) {
        const spot = mapSpots.find(row => row.id === record.mapSpotId);
        if (spot) record.locationName = spot.name;
      }
      if (record.customLocationId != null) {
        const request = transaction.objectStore(CUSTOM_STORE_NAME).get(record.customLocationId);
        request.onsuccess = () => {
          if (!request.result || !validateCustomLocation(request.result).valid) { fail(new CatchRecordError('VALIDATION', '사용자 장소를 찾을 수 없습니다. 다시 검색해 선택해 주세요.')); return; }
          record.locationName = request.result.name;
          write();
        };
      } else write();
    }

    async function listCustomLocations() {
      const rows = await transact('readonly', (store, done) => { store.getAll().onsuccess = event => done(event.target.result); }, [CUSTOM_STORE_NAME]);
      return rows.filter(row => validateCustomLocation(row).valid);
    }

    async function addCustomLocation(input) {
      const now = new Date().toISOString();
      const location = { customLocationId: createRecordId(), name: String(input.name || '').trim(),
        address: String(input.address || '').trim(), memo: String(input.memo || '').trim(),
        latitude: input.latitude ?? null, longitude: input.longitude ?? null, createdAt: now, updatedAt: now };
      const validation = validateCustomLocation(location);
      if (!validation.valid) throw new CatchRecordError('VALIDATION', validation.errors.join(' '));
      if (findDuplicateLocation(mapSpots, [], location.name)) throw new CatchRecordError('DUPLICATE_MAP', '지도에 이미 같은 이름의 장소가 있습니다. 기존 지도 장소를 선택해 주세요.');
      return transact('readwrite', (store, done, fail) => {
        // The check and insert share a transaction; concurrent tabs cannot create duplicate names.
        store.index('name').get(location.name).onsuccess = event => {
          try {
            if (event.target.result) throw new CatchRecordError('DUPLICATE_CUSTOM', '이미 등록된 장소입니다. 검색 결과에서 선택해 주세요.');
            store.add(location);
            done(location);
          } catch (error) { fail(error); }
        };
      }, [CUSTOM_STORE_NAME]);
    }

    async function addRecord(input) {
      const now = new Date().toISOString();
      const record = ensureValid({ recordId: createRecordId(), speciesId: input.speciesId, caughtAt: input.caughtAt, count: input.count,
        photoBlob: input.photoBlob, photoName: input.photoName, photoType: input.photoBlob?.type,
        locationName: input.locationName || '', mapSpotId: input.mapSpotId ?? null, customLocationId: input.customLocationId ?? null,
        memo: input.memo || '', createdAt: now, updatedAt: now });
      await inspectPhoto(record.photoBlob);
      return transact('readwrite', (store, done, fail, transaction) => writeRecord(store, transaction, record, 'add', done, fail), [STORE_NAME, CUSTOM_STORE_NAME]);
    }

    async function updateRecord(recordId, changes) {
      if (!nonempty(recordId)) throw new CatchRecordError('NOT_FOUND');
      if (Object.hasOwn(changes, 'photoBlob')) await inspectPhoto(changes.photoBlob);
      return transact('readwrite', (store, done, fail, transaction) => {
        const request = store.get(recordId);
        request.onsuccess = () => {
          try {
            const previous = request.result;
            if (!previous) throw new CatchRecordError('NOT_FOUND');
            if (Object.hasOwn(changes, 'speciesId') && changes.speciesId !== previous.speciesId) throw new CatchRecordError('VALIDATION', '기록의 어종은 변경할 수 없습니다.');
            const updatedAt = new Date(Math.max(Date.now(), new Date(previous.updatedAt).getTime() + 1)).toISOString();
            const record = ensureValid({ ...previous,
              caughtAt: changes.caughtAt, count: changes.count, locationName: changes.locationName || '', memo: changes.memo || '', updatedAt,
              mapSpotId: Object.hasOwn(changes, 'mapSpotId') ? changes.mapSpotId : previous.mapSpotId ?? null,
              customLocationId: Object.hasOwn(changes, 'customLocationId') ? changes.customLocationId : previous.customLocationId ?? null,
              ...(Object.hasOwn(changes, 'photoBlob') ? { photoBlob: changes.photoBlob, photoName: changes.photoName, photoType: changes.photoBlob.type } : {}),
            });
            writeRecord(store, transaction, record, 'put', done, fail);
          } catch (error) { fail(error); }
        };
      }, [STORE_NAME, CUSTOM_STORE_NAME]);
    }

    async function deleteRecord(recordId) {
      if (!nonempty(recordId)) return false;
      return transact('readwrite', (store, done) => {
        const request = store.getKey(recordId);
        request.onsuccess = () => {
          const exists = request.result !== undefined;
          if (exists) store.delete(recordId);
          done(exists);
        };
      });
    }

    async function syncAchievementUnlocks(achievementIds) {
      const ids = [...new Set(achievementIds)];
      if (!ids.every(id => typeof id === 'string' && /^[a-z0-9-]{1,100}$/.test(id))) throw new CatchRecordError('VALIDATION', '업적 ID가 올바르지 않습니다.');
      return transact('readwrite', (store, done, fail) => {
        store.getAll().onsuccess = event => {
          try {
            const unlocks = event.target.result.filter(row => nonempty(row.achievementId) && validTimestamp(row.unlockedAt));
            const existing = new Set(unlocks.map(row => row.achievementId));
            const added = [];
            const unlockedAt = new Date().toISOString();
            for (const achievementId of ids) {
              if (existing.has(achievementId)) continue;
              const row = { achievementId, unlockedAt };
              // Preserve the first timestamp when another tab has already earned this badge.
              store.add(row); added.push(row); unlocks.push(row);
            }
            done({ unlocks, added });
          } catch (error) { fail(error); }
        };
      }, [ACHIEVEMENT_STORE_NAME]);
    }

    return { open, loadAll, addRecord, updateRecord, deleteRecord, listCustomLocations, addCustomLocation, syncAchievementUnlocks,
      close() { generation++; if (database) database.close(); database = null; } };
  }

  return { DB_NAME, DB_VERSION, STORE_NAME, CUSTOM_STORE_NAME, ACHIEVEMENT_STORE_NAME, MAX_PHOTO_BYTES, PHOTO_TYPES, CatchRecordError,
    localDate, validDate, parseCount, photoError, inspectPhoto, validateCatchRecord, summarizeCollection,
    sortRecords, createRecordId, storageErrorMessage, upgradeSchema, createCatchRecordStore,
    searchLocations, findDuplicateLocation, validateCustomLocation };
});
