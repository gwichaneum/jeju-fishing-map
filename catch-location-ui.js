(function (root) {
  'use strict';
  root.createCatchLocationUI = function ({ store, mapSpots, getCustomLocations, setBusy }) {
    const api = root.CatchRecords;
    const field = document.querySelector('.catch-location-field');
    const input = field.querySelector('#catch-location');
    const dropdown = field.querySelector('#catch-location-dropdown');
    const list = field.querySelector('#catch-location-results');
    const status = field.querySelector('#catch-location-search-status');
    const selection = field.querySelector('#catch-location-selection');
    const selectedText = field.querySelector('#catch-location-selected');
    const draft = field.querySelector('#custom-location-fields');
    const draftError = field.querySelector('#custom-location-error');
    const draftFields = Object.fromEntries(['name', 'address', 'latitude', 'longitude', 'memo']
      .map(key => [key, field.querySelector(`#custom-location-${key}`)]));
    let customs = [];
    let selected = null;
    let legacyName = '';
    let results = [];
    let active = -1;
    let generation = 0;
    let loadingError = '';
    let searchNotice = '';
    let saving = false;

    function closeResults() {
      dropdown.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }

    function choose(location) {
      selected = location;
      legacyName = '';
      input.value = location.name;
      input.readOnly = true;
      selection.hidden = false;
      selectedText.textContent = `선택한 장소: ${location.name} · ${location.source === 'map' ? '지도 포인트' : '사용자 등록 장소'}`;
      draft.hidden = true;
      input.setAttribute('aria-invalid', 'false');
      field.querySelector('#catch-location-error').hidden = true;
      closeResults();
    }

    function renderResults() {
      if (selected || !draft.hidden) return;
      results = api.searchLocations(mapSpots, customs, input.value);
      list.replaceChildren();
      active = -1;
      input.removeAttribute('aria-activedescendant');
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      for (const [index, location] of results.entries()) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'catch-location-option';
        button.id = `catch-location-option-${index}`;
        button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', 'false');
        const name = document.createElement('strong');
        name.textContent = `${location.source === 'map' ? '📍' : '★'} ${location.name}`;
        const meta = document.createElement('span');
        meta.textContent = location.source === 'map'
          ? `${location.region || '제주'} · ${location.category || '포인트'} · 지도 포인트` : '사용자 등록 장소';
        button.append(name, meta);
        button.addEventListener('click', () => { choose(location); input.focus(); });
        li.append(button);
        list.append(li);
      }
      status.textContent = searchNotice || loadingError || (!input.value.trim() ? '장소 이름·지역·주소를 입력해 주세요.'
        : results.length ? `${results.length}개 표시 · 최대 8개` : '일치하는 지도 포인트가 없습니다.');
    }

    input.addEventListener('input', () => { searchNotice = ''; if (!selected) renderResults(); });
    input.addEventListener('focus', renderResults);
    input.addEventListener('keydown', event => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === 'Escape' && !dropdown.hidden) {
        event.preventDefault(); event.stopPropagation(); closeResults();
      } else if (['ArrowDown', 'ArrowUp'].includes(event.key) && !selected && draft.hidden) {
        event.preventDefault();
        if (dropdown.hidden) renderResults();
        if (!results.length) return;
        active = (active + (event.key === 'ArrowDown' ? 1 : active < 0 ? 0 : -1) + results.length) % results.length;
        const options = [...list.querySelectorAll('[role="option"]')];
        options.forEach((option, index) => option.setAttribute('aria-selected', String(index === active)));
        input.setAttribute('aria-activedescendant', options[active].id);
        options[active].scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' && !dropdown.hidden) {
        event.preventDefault();
        if (active >= 0) choose(results[active]);
      }
    });
    field.addEventListener('focusout', () => {
      setTimeout(() => { if (!field.contains(document.activeElement)) closeResults(); }, 0);
    });
    field.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !dropdown.hidden) {
        event.preventDefault(); event.stopPropagation(); input.focus(); closeResults();
      }
    });
    field.querySelector('#catch-location-clear').addEventListener('click', () => {
      selected = null; legacyName = ''; searchNotice = ''; input.readOnly = false; input.value = '';
      selection.hidden = true;
      input.focus(); renderResults();
    });
    field.querySelector('#catch-location-create').addEventListener('click', () => {
      closeResults();
      draft.hidden = false;
      draftFields.name.value = input.value.trim();
      draftError.hidden = true;
      draftFields.name.focus();
    });
    field.querySelector('#custom-location-cancel').addEventListener('click', () => {
      draft.hidden = true;
      input.focus(); renderResults();
    });

    async function saveCustomLocation() {
      if (saving) return;
      draftError.hidden = true;
      const name = draftFields.name.value.trim();
      try {
        if (!name) throw new api.CatchRecordError('VALIDATION', '장소 이름을 입력해 주세요.');
        // Refresh before checking, so a location added in another tab is offered for selection too.
        saving = true; setBusy(true);
        customs = await store.listCustomLocations();
        const duplicate = api.findDuplicateLocation(mapSpots, customs, name);
        if (duplicate) {
          input.value = duplicate.name;
          draft.hidden = true;
          renderResults();
          throw new api.CatchRecordError(duplicate.source === 'map' ? 'DUPLICATE_MAP' : 'DUPLICATE_CUSTOM',
            duplicate.source === 'map' ? '지도에 이미 같은 이름의 장소가 있습니다. 검색 결과에서 선택해 주세요.' : '이미 등록된 장소입니다. 검색 결과에서 선택해 주세요.');
        }
        for (const key of ['latitude', 'longitude']) {
          if (draftFields[key].validity.badInput) throw new api.CatchRecordError('VALIDATION', '좌표를 올바른 숫자로 입력해 주세요.');
        }
        const location = await store.addCustomLocation({ name, address: draftFields.address.value, memo: draftFields.memo.value,
          latitude: draftFields.latitude.value.trim() ? Number(draftFields.latitude.value) : null,
          longitude: draftFields.longitude.value.trim() ? Number(draftFields.longitude.value) : null });
        customs.push(location);
        choose({ ...location, source: 'custom' });
      } catch (error) {
        const message = api.storageErrorMessage(error);
        if (draft.hidden) { searchNotice = message; renderResults(); }
        else { draftError.textContent = message; draftError.hidden = false; }
      } finally {
        saving = false; setBusy(false);
        if (draft.hidden) input.focus(); else draftFields.name.focus();
      }
    }
    field.querySelector('#custom-location-save').addEventListener('click', saveCustomLocation);
    draft.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.isComposing && event.target.tagName === 'INPUT') {
        event.preventDefault(); saveCustomLocation();
      }
    });

    return {
      reset(record) {
        const current = ++generation;
        customs = [...getCustomLocations()];
        selected = null; legacyName = record?.locationName || ''; loadingError = ''; searchNotice = '';
        input.value = legacyName; input.readOnly = false;
        selection.hidden = draft.hidden = draftError.hidden = true;
        for (const node of Object.values(draftFields)) node.value = '';
        closeResults();
        if (record?.mapSpotId != null) choose({ ...(mapSpots.find(spot => spot.id === record.mapSpotId)
          || { id: record.mapSpotId, name: record.locationName }), source: 'map' });
        else if (record?.customLocationId != null) choose({ ...(customs.find(row => row.customLocationId === record.customLocationId)
          || { customLocationId: record.customLocationId, name: record.locationName }), source: 'custom' });
        store.listCustomLocations().then(rows => {
          if (current !== generation) return;
          customs = rows;
          if (!dropdown.hidden) renderResults();
        }).catch(error => {
          if (current !== generation) return;
          loadingError = `${api.storageErrorMessage(error)} 지도 포인트는 계속 검색할 수 있습니다.`;
          if (!dropdown.hidden) renderResults();
        });
      },
      value() {
        return { locationName: selected?.name || input.value.trim(),
          mapSpotId: selected?.source === 'map' ? selected.id : null,
          customLocationId: selected?.source === 'custom' ? selected.customLocationId : null };
      },
      validate() {
        if (!draft.hidden) return '장소 등록을 완료하거나 등록 취소를 눌러 주세요.';
        if (!selected && input.value.trim() && input.value !== legacyName) return '검색 결과에서 장소를 선택하거나 새 장소로 등록해 주세요.';
        return '';
      },
      dirtyValue() { return [input.value, selected?.source, selected?.id, selected?.customLocationId, !draft.hidden, ...Object.values(draftFields).map(node => node.value)]; },
      close() { generation++; closeResults(); },
    };
  };
})(globalThis);
