(function (root) {
  'use strict';
  root.createCatchRecordUI = function ({ store, mapSpots, getState, onCommitted, announce }) {
    const api = root.CatchRecords;
    const dialog = document.querySelector('#catch-record-dialog');
    const form = document.querySelector('#catch-record-form');
    const photo = form.querySelector('#catch-photo');
    const preview = form.querySelector('#catch-photo-preview');
    const keepPhoto = form.querySelector('#catch-keep-photo');
    const submit = form.querySelector('#catch-form-submit');
    const fields = { photo, date: form.querySelector('#catch-date'), count: form.querySelector('#catch-count'),
      location: form.querySelector('#catch-location'), memo: form.querySelector('#catch-memo') };
    const errors = Object.fromEntries(Object.keys(fields).map(key => [key, form.querySelector(`#catch-${key}-error`)]));
    const generalError = form.querySelector('#catch-form-error');
    let species = null;
    let existing = null;
    let selectedPhoto = null;
    let photoState = 'empty';
    let previewUrl = null;
    let photoGeneration = 0;
    let busy = false;
    let suppressRestore = false;
    let returnRecordId = null;
    const thumbnailUrls = new Set();
    let initialValues = '';
    const locationUI = root.createCatchLocationUI({ store, mapSpots, getCustomLocations: () => getState().customLocations || [], setBusy });
    const formValues = () => JSON.stringify([fields.date.value, fields.count.value, locationUI.dirtyValue(), fields.memo.value]);
    const isDirty = () => dialog.open && (formValues() !== initialValues || photo.files.length > 0);
    root.addEventListener('beforeunload', event => {
      if (!isDirty()) return;
      event.preventDefault();
      event.returnValue = '';
    });

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function fieldError(key, message = '') {
      errors[key].textContent = message;
      errors[key].hidden = !message;
      fields[key].setAttribute('aria-invalid', String(Boolean(message)));
    }

    function clearErrors() {
      for (const key of Object.keys(fields)) fieldError(key);
      generalError.textContent = '';
      generalError.hidden = true;
    }

    function setPreview(blob) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      preview.removeAttribute('src');
      preview.hidden = !blob;
      if (blob) { previewUrl = URL.createObjectURL(blob); preview.src = previewUrl; }
    }

    function restoreFocus() {
      const scope = document.querySelector('#species-detail-content');
      const button = returnRecordId
        ? [...scope.querySelectorAll('.catch-edit')].find(node => node.dataset.recordId === returnRecordId) : null;
      (button || scope.querySelector('.catch-add') || document.querySelector('#species-detail-close')).focus({ preventScroll: true });
    }

    function setBusy(value) {
      busy = value;
      form.setAttribute('aria-busy', String(value));
      for (const node of form.querySelectorAll('input, textarea, button')) node.disabled = value;
      document.querySelector('#catch-form-close').disabled = value;
      document.querySelector('#species-detail-close').disabled = value;
      submit.disabled = value || photoState === 'pending';
      submit.textContent = value ? '저장 중…' : existing ? '수정 저장' : '기록 저장';
      for (const button of document.querySelectorAll('.catch-add, .catch-edit, .catch-delete')) button.disabled = value || !getState().ready;
    }

    function openForm(item, record = null) {
      if (busy || !getState().ready) return;
      species = item;
      existing = record;
      returnRecordId = record?.recordId || null;
      suppressRestore = false;
      form.reset();
      clearErrors();
      selectedPhoto = null;
      photoState = record ? 'valid' : 'empty';
      photo.required = !record;
      fields.date.max = api.localDate();
      fields.date.value = record?.caughtAt || api.localDate();
      fields.count.value = record?.count ?? 1;
      locationUI.reset(record);
      fields.memo.value = record?.memo || '';
      initialValues = formValues();
      keepPhoto.hidden = !record;
      form.querySelector('#catch-photo-status').textContent = record ? '사진을 바꾸지 않으면 기존 사진이 유지됩니다.' : '';
      setPreview(record?.photoBlob);
      document.querySelector('#catch-form-title').textContent = `${item.nameKo} 조과 ${record ? '수정' : '등록'}`;
      setBusy(false);
      dialog.showModal();
      document.body.classList.add('species-detail-open');
      dialog.scrollTop = 0;
      photo.focus({ preventScroll: true });
    }

    function cancelForm() { if (!busy) dialog.close(); }
    document.querySelector('#catch-form-close').addEventListener('click', cancelForm);
    document.querySelector('#catch-form-cancel').addEventListener('click', cancelForm);
    dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
    dialog.addEventListener('close', () => {
      locationUI.close();
      photoGeneration++;
      setPreview(null);
      selectedPhoto = null;
      photo.value = '';
      form.querySelector('#catch-photo-status').textContent = '';
      if (!document.querySelector('#species-detail').open) document.body.classList.remove('species-detail-open');
      if (!suppressRestore) restoreFocus();
    });
    keepPhoto.addEventListener('click', () => {
      photoGeneration++;
      selectedPhoto = null;
      photo.value = '';
      photoState = 'valid';
      setPreview(existing.photoBlob);
      fieldError('photo');
      form.querySelector('#catch-photo-status').textContent = '기존 사진을 유지합니다.';
      setBusy(false);
    });
    photo.addEventListener('change', async () => {
      const generation = ++photoGeneration;
      selectedPhoto = null;
      fieldError('photo');
      const file = photo.files[0];
      if (!file) {
        photoState = existing ? 'valid' : 'empty';
        setPreview(existing?.photoBlob);
        setBusy(false);
        return;
      }
      photoState = 'pending';
      setPreview(null);
      form.querySelector('#catch-photo-status').textContent = '사진을 확인하고 있어요.';
      submit.disabled = true;
      try {
        await api.inspectPhoto(file);
        if (generation !== photoGeneration || !dialog.open) return;
        selectedPhoto = file;
        photoState = 'valid';
        setPreview(file);
        form.querySelector('#catch-photo-status').textContent = '사진 미리보기를 확인해 주세요.';
      } catch (error) {
        if (generation !== photoGeneration || !dialog.open) return;
        photoState = 'invalid';
        fieldError('photo', api.storageErrorMessage(error));
        form.querySelector('#catch-photo-status').textContent = '';
      } finally {
        if (generation === photoGeneration) submit.disabled = busy;
      }
    });
    for (const key of ['date', 'count', 'location', 'memo']) fields[key].addEventListener('input', () => fieldError(key));

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      clearErrors();
      if (photoState !== 'valid') fieldError('photo', photoState === 'pending' ? '사진 확인이 끝난 뒤 저장해 주세요.' : '표시할 수 있는 사진을 선택해 주세요.');
      if (!api.validDate(fields.date.value)) fieldError('date', '잡은 날짜를 올바르게 입력해 주세요.');
      else if (fields.date.value > api.localDate()) fieldError('date', '잡은 날짜는 오늘 또는 이전 날짜로 입력해 주세요.');
      const count = api.parseCount(fields.count.value);
      if (!Number.isSafeInteger(count)) fieldError('count', '잡은 마릿수는 1마리 이상의 정수로 입력해 주세요.');
      if (fields.location.value.length > 120) fieldError('location', '장소는 120자 이내로 입력해 주세요.');
      else if (locationUI.validate()) fieldError('location', locationUI.validate());
      if (fields.memo.value.length > 2000) fieldError('memo', '메모는 2,000자 이내로 입력해 주세요.');
      const firstInvalid = Object.keys(fields).find(key => !errors[key].hidden);
      if (firstInvalid) { fields[firstInvalid].focus(); return; }
      const input = { speciesId: species.speciesId, caughtAt: fields.date.value, count,
        ...locationUI.value(), memo: fields.memo.value.trim() };
      if (selectedPhoto) { input.photoBlob = selectedPhoto; input.photoName = selectedPhoto.name; }
      setBusy(true);
      let committed = false;
      try {
        const firstCatch = !getState().summary.bySpecies[species.speciesId].collected;
        const record = existing ? await store.updateRecord(existing.recordId, input) : await store.addRecord(input);
        const editing = Boolean(existing);
        suppressRestore = true;
        dialog.close();
        onCommitted({ operation: editing ? 'update' : 'add', record });
        announce(editing ? '조과 기록을 수정했습니다.' : firstCatch ? '첫 수집 성공! 도감이 해금되었습니다.' : '조과 기록을 저장했습니다.');
        committed = true;
      } catch (error) {
        generalError.textContent = api.storageErrorMessage(error);
        generalError.hidden = false;
        generalError.focus();
      } finally { setBusy(false); if (committed) restoreFocus(); }
    });

    function cleanup() {
      for (const url of thumbnailUrls) URL.revokeObjectURL(url);
      thumbnailUrls.clear();
    }

    function mount(item) {
      cleanup();
      const state = getState();
      const stats = state.summary.bySpecies[item.speciesId];
      const section = element('section', 'species-catches');
      section.setAttribute('aria-labelledby', 'species-catches-heading');
      const heading = element('div', 'catch-section-heading');
      const title = element('h3', '', '나의 조과');
      title.id = 'species-catches-heading';
      const add = element('button', 'catalog-button catalog-primary-button catch-add', '잡은 기록 등록');
      add.type = 'button';
      add.disabled = busy || !state.ready;
      add.addEventListener('click', () => openForm(item));
      heading.append(title, add);
      section.append(heading);
      const notice = element('p', 'catch-detail-notice');
      notice.id = 'catch-detail-notice';
      notice.setAttribute('role', 'status');
      section.append(notice);
      if (!state.ready) {
        section.append(element('p', 'catch-form-caption', state.storageMessage || '조과 기록을 확인한 뒤 등록할 수 있습니다. 도감 화면의 기록 안내를 확인해 주세요.'));
      }
      const numbers = element('dl', 'catch-statistics');
      for (const [label, value, className] of [
        ['총 마릿수', state.hasSnapshot ? `${stats.totalCount.toLocaleString('ko-KR')}마리` : '확인 중', 'catch-total-count'],
        ['기록 횟수', state.hasSnapshot ? `${stats.recordCount}회` : '확인 중', 'catch-record-count'],
        ['첫 수집', stats.firstCaughtAt || '아직 없음', 'catch-first-date'],
        ['최근 조과', stats.lastCaughtAt || '아직 없음', 'catch-last-date'],
      ]) {
        const row = element('div');
        row.append(element('dt', '', label), element('dd', className, value));
        numbers.append(row);
      }
      section.append(numbers, element('p', 'catch-form-caption', '최근 잡은 날짜순 · 첫 수집과 최근 조과는 잡은 날짜 기준'));
      const list = element('ul', 'catch-record-list');
      for (const record of api.sortRecords(state.records.filter(row => row.speciesId === item.speciesId))) {
        const li = element('li', 'catch-record');
        li.dataset.recordId = record.recordId;
        const img = element('img', 'catch-thumbnail');
        const url = URL.createObjectURL(record.photoBlob);
        thumbnailUrls.add(url);
        img.src = url;
        img.alt = `${item.nameKo} ${record.caughtAt} 조과 사진`;
        img.loading = 'lazy';
        img.width = img.height = 96;
        const text = element('div', 'catch-record-copy');
        text.append(element('p', 'catch-record-date', `${record.caughtAt} · ${record.count.toLocaleString('ko-KR')}마리`),
          element('p', 'catch-record-location', record.locationName || '장소 미입력'),
          element('p', 'catch-record-memo', record.memo || '메모 없음'));
        const actions = element('div', 'catch-record-actions');
        const edit = element('button', 'catalog-button catch-edit', '수정');
        const remove = element('button', 'catalog-button catch-delete', '삭제');
        for (const button of [edit, remove]) {
          button.type = 'button';
          button.dataset.recordId = record.recordId;
          button.disabled = busy || !state.ready;
        }
        edit.setAttribute('aria-label', `${record.caughtAt} ${record.count}마리 기록 수정`);
        remove.setAttribute('aria-label', `${record.caughtAt} ${record.count}마리 기록 삭제`);
        edit.addEventListener('click', () => openForm(item, record));
        remove.addEventListener('click', async () => {
          if (busy || !root.confirm('이 조과 기록을 삭제할까요?')) return;
          returnRecordId = null;
          setBusy(true);
          let committed = false;
          try {
            const changed = await store.deleteRecord(record.recordId);
            onCommitted({ operation: 'delete', recordId: record.recordId });
            announce(changed ? '조과 기록을 삭제했습니다.' : '이미 삭제된 기록입니다. 목록을 갱신했습니다.');
            committed = true;
          } catch (error) { announce(api.storageErrorMessage(error), true); }
          finally { setBusy(false); if (committed) restoreFocus(); }
        });
        actions.append(edit, remove);
        text.append(actions);
        li.append(img, text);
        list.append(li);
      }
      section.append(list);
      if (!list.children.length) section.append(element('p', 'catch-record-empty', state.hasSnapshot ? '아직 남긴 조과가 없어요. 첫 기록을 등록해 보세요.' : '저장된 기록을 확인하고 있어요.'));
      return section;
    }

    return { mount, cleanup, isBusy: () => busy, isEditing: () => dialog.open, isDirty, cancelEditing: cancelForm };
  };
})(globalThis);
