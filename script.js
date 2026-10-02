const yearElement = document.querySelector("[data-current-year]");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const favoriteStore = typeof createFavoriteStore === "function" && typeof fishingSpots !== "undefined"
  ? createFavoriteStore(fishingSpots) : null;

if (favoriteStore) {
  window.addEventListener("storage", event => {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null) favoriteStore.reload();
  });
}

function isDisplayableFishingSpot(spot) {
  return ["fishing-spot", "personal-spot", "access-point", "landmark"].includes(spot.kind)
    && spot.needsVerification === false
    && Number.isFinite(spot.latitude)
    && Number.isFinite(spot.longitude)
    && spot.latitude >= -90 && spot.latitude <= 90
    && spot.longitude >= -180 && spot.longitude <= 180;
}

function isPersonalReferenceSpot(spot) {
  return ["personal-spot", "access-point", "landmark"].includes(spot.kind);
}

function hasValidCoordinates(location) {
  return Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
    && Math.abs(location.latitude) <= 90 && Math.abs(location.longitude) <= 180;
}

function haversineDistanceMeters(from, to) {
  if (!hasValidCoordinates(from) || !hasValidCoordinates(to)) return Infinity;
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude))
    * Math.sin(longitudeDelta / 2) ** 2;
  const clamped = Math.min(1, Math.max(0, a));
  return 6371000 * 2 * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
}

function findNearbyRestroom(spot, toilets, radiusMeters = 500) {
  if (spot.needsVerification !== false || !hasValidCoordinates(spot)) {
    return { status: "unverified-location" };
  }
  let nearest = null;
  let distanceMeters = Infinity;
  for (const toilet of toilets) {
    if (!hasValidCoordinates(toilet)
      || !toilet.address?.startsWith("제주특별자치도 ")
      || toilet.latitude < 33.1 || toilet.latitude > 33.65
      || toilet.longitude < 126.1 || toilet.longitude > 126.98) continue;
    const distance = haversineDistanceMeters(spot, toilet);
    if (distance <= radiusMeters && distance < distanceMeters) {
      nearest = toilet;
      distanceMeters = distance;
    }
  }
  return nearest
    ? { status: "nearby", restroom: nearest, distanceMeters }
    : { status: "no-confirmed-info" };
}

function createRestroomPopupSection(spot) {
  const section = document.createElement("section");
  section.className = "fishing-popup-restroom";
  const heading = document.createElement("h3");
  heading.textContent = "근처 공중화장실";
  section.append(heading);

  const result = findNearbyRestroom(spot, typeof restrooms === "undefined" ? [] : restrooms);
  section.dataset.status = result.status;
  const summary = document.createElement("p");
  summary.className = "fishing-popup-restroom-summary";
  if (result.status !== "nearby") {
    summary.textContent = result.status === "unverified-location"
      ? "포인트 위치 확인 후 주변 정보를 확인할 수 있습니다."
      : "500m 이내 확인된 공중화장실 정보 없음";
    section.append(summary);
    return section;
  }

  const toilet = result.restroom;
  section.dataset.restroomId = toilet.id;
  const name = document.createElement("p");
  name.className = "fishing-popup-restroom-name";
  name.textContent = toilet.name;
  const approximateDistance = Math.max(10, Math.round(result.distanceMeters / 10) * 10);
  summary.textContent = `약 ${approximateDistance}m (직선거리) · ${toilet.openHours || "정보 없음"}`;
  const address = document.createElement("p");
  address.className = "fishing-popup-restroom-address";
  address.textContent = toilet.address;
  const meta = document.createElement("p");
  meta.className = "fishing-popup-restroom-meta";
  meta.textContent = `정보 기준일: ${toilet.dataDate || "정보 없음"}`;
  if (toilet.type) meta.append(` · ${toilet.type}`);
  if (toilet.manager) meta.append(` · 관리: ${toilet.manager}`);
  const source = document.createElement("a");
  source.className = "fishing-popup-restroom-source";
  source.href = toilet.sourceUrl;
  source.textContent = "화장실 정보 출처";
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  const caution = document.createElement("p");
  caution.className = "fishing-popup-restroom-meta";
  caution.textContent = "도보거리와 다를 수 있으며, 현재 개방 여부는 현장 확인이 필요합니다.";
  section.append(name, summary, address, meta, source, caution);
  return section;
}

function createFishingSpotPopupContent(spot) {
  const content = document.createElement("div");
  const header = document.createElement("div");
  header.className = "fishing-popup-header";

  if (isPersonalReferenceSpot(spot)) {
    const badge = document.createElement("span");
    badge.className = "fishing-popup-badge";
    badge.textContent = "개인 저장 포인트";
    header.append(badge);
  }

  const name = document.createElement("h2");
  name.className = "fishing-popup-name";
  name.id = `fishing-spot-title-${spot.id}`;
  name.textContent = spot.name;

  const region = document.createElement("p");
  region.className = "fishing-popup-region";
  region.textContent = spot.region;

  const type = document.createElement("p");
  type.className = "fishing-popup-type";
  const referenceTypes = {
    "personal-spot": "개인 포인트",
    "access-point": "해안 접근 기준점",
    landmark: "개인 기준점",
  };
  type.textContent = `유형: ${referenceTypes[spot.kind] || spot.category}`;
  header.append(name, region, type);
  const distance = document.createElement("p");
  distance.className = "fishing-popup-distance";
  distance.hidden = true;
  header.append(distance);

  const details = document.createElement("div");
  details.className = "fishing-popup-details";
  const fields = document.createElement("dl");

  for (const [key, label, value] of [
    ["note", "내 메모", spot.userNote],
    ["location-note", "위치 참고", spot.locationNote],
    ["species", "확인된 주요 어종", spot.species.join(" / ")],
    ["reported-species", "사용자 제보 어종", (spot.reportedSpecies || []).join(" / ")],
    ["methods", "확인된 낚시 방법", spot.methods.join(" / ")],
  ]) {
    if (!value) continue;
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.className = `fishing-popup-${key}`;
    description.textContent = value;
    fields.append(term, description);
    if (key === "note" && spot.safetyNote) {
      const caution = document.createElement("dd");
      caution.className = "fishing-popup-caution";
      caution.textContent = "안전 관련 내용은 과거 개인 메모이며 현재 안전을 보장하지 않습니다.";
      fields.append(caution);
    }
  }
  details.append(fields);

  for (const fishingSource of [spot.fishingInfoSource, ...(spot.additionalFishingInfoSources || [])]) {
    if (!fishingSource) continue;
    const source = document.createElement("p");
    source.className = "fishing-popup-source";
    source.append(fishingSource.species ? `${fishingSource.species.join(" / ")} 출처: ` : "어종·방법 출처: ");
    const url = new URL(fishingSource.url);
    if (url.protocol === "https:" || url.protocol === "http:") {
      const link = document.createElement("a");
      link.href = url.href;
      link.textContent = fishingSource.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      source.append(link);
    }
    details.append(source);
  }

  details.append(createRestroomPopupSection(spot));
  if (typeof createSpotWeatherSection === "function") details.append(createSpotWeatherSection());
  if (typeof createSpotTideSection === "function") details.append(createSpotTideSection());
  content.append(header, details);
  if (favoriteStore) {
    const actions = document.createElement("div");
    actions.className = "fishing-popup-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fishing-popup-favorite";
    button.dataset.favoriteId = spot.id;
    const icon = document.createElement("span");
    icon.className = "favorite-icon";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "favorite-button-label";
    button.append(icon, label);
    button.addEventListener("click", () => favoriteStore.toggleFavorite(spot.id));
    updateFavoriteButton(button, spot.id);
    actions.append(button);
    content.append(actions);
  }
  return content;
}

function updateFavoriteButton(button, id) {
  const selected = favoriteStore.isFavorite(id);
  button.setAttribute("aria-pressed", String(selected));
  button.title = selected ? "즐겨찾기 해제" : "즐겨찾기 추가";
  button.querySelector(".favorite-button-label").textContent = selected ? "즐겨찾기됨" : "즐겨찾기";
}

function fitFishingSpotPopup(map, popup, spot) {
  const point = map.project([spot.longitude, spot.latitude]);
  const { clientWidth: width, clientHeight: height } = map.getContainer();
  // Preserve selection while the map is temporarily hidden.
  if (!width || !height) return;
  if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
    popup.remove();
    return;
  }

  const dialog = popup.getElement();
  const header = dialog.querySelector(".fishing-popup-header");
  const details = dialog.querySelector(".fishing-popup-details");
  const actions = dialog.querySelector(".fishing-popup-actions");
  const actionsHeight = actions ? actions.offsetHeight + 12 : 0;
  const above = point.y - 32;
  const below = height - point.y - 32;
  const anchor = above >= below ? "bottom" : "top";
  const weather = dialog.querySelector(".fishing-popup-weather") || dialog.querySelector(".fishing-popup-tides");
  const detailsHeight = weather
    ? Math.min(280, height * 0.45, height - header.offsetHeight - actionsHeight - 64)
    : Math.max(above, below) - header.offsetHeight - actionsHeight - 48;
  details.style.maxHeight = `${Math.max(actions ? 64 : 24, detailsHeight)}px`;
  if (weather && dialog.offsetHeight > height - 16) {
    details.style.maxHeight = `${Math.max(24, details.offsetHeight - dialog.offsetHeight + height - 16)}px`;
  }

  // Keep wide, scrollable popups within a narrow map without moving its camera.
  const halfWidth = dialog.offsetWidth / 2;
  const center = Math.max(halfWidth + 16, Math.min(width - halfWidth - 16, point.x));
  popup.options.anchor = anchor;
  let verticalOffset = anchor === "bottom" ? -16 : 16;
  if (actions || weather) {
    const popupHeight = dialog.offsetHeight;
    const minY = anchor === "bottom" ? popupHeight + 8 : 8;
    const maxY = anchor === "bottom" ? height - 8 : height - popupHeight - 8;
    verticalOffset = Math.max(minY, Math.min(maxY, point.y + verticalOffset)) - point.y;
  }
  popup.setOffset([center - point.x, verticalOffset]);
}

function addFishingSpotMarkers(map, maplibregl) {
  if (typeof fishingSpots === "undefined") {
    return;
  }

  let activePopup = null;
  let activeSpot = null;
  let pendingFocus = null;
  const markers = new Map();

  const cancelPendingFocus = () => {
    if (!pendingFocus) return;
    map.off("moveend", pendingFocus);
    pendingFocus = null;
    map.stop();
  };

  const fitActivePopup = () => {
    if (activePopup) fitFishingSpotPopup(map, activePopup, activeSpot);
  };
  map.on("move", fitActivePopup);
  map.on("resize", fitActivePopup);

  const updateFavoriteMarkers = () => {
    for (const { spot, marker, favoriteButton } of markers.values()) {
      const selected = favoriteStore.isFavorite(spot.id);
      const element = marker.getElement();
      element.classList.toggle("fishing-marker-favorite", selected);
      element.title = selected ? `${spot.name} · 즐겨찾기` : spot.name;
      if (favoriteButton) updateFavoriteButton(favoriteButton, spot.id);
    }
  };

  for (const spot of fishingSpots.filter(isDisplayableFishingSpot)) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "fishing-marker";
    if (isPersonalReferenceSpot(spot)) element.classList.add("fishing-marker-personal");
    element.dataset.spotId = spot.id;
    element.title = spot.name;
    element.setAttribute("aria-label", `${spot.name} 정보 보기`);
    element.setAttribute("aria-expanded", "false");
    element.setAttribute("aria-haspopup", "dialog");

    const dot = document.createElement("span");
    dot.className = "fishing-marker-dot";
    dot.setAttribute("aria-hidden", "true");
    element.append(dot);

    if (favoriteStore) {
      const badge = document.createElement("span");
      badge.className = "fishing-marker-favorite-badge";
      badge.setAttribute("aria-hidden", "true");
      element.append(badge);
    }

    const content = createFishingSpotPopupContent(spot);
    const favoriteButton = content.querySelector(".fishing-popup-favorite");
    let stopTides = null;

    const popup = new maplibregl.Popup({
      className: "fishing-popup",
      offset: 16,
      anchor: "bottom",
      focusAfterOpen: false,
      maxWidth: "280px",
      padding: { top: 24, right: 8, bottom: 24, left: 8 },
    }).setDOMContent(content);

    const marker = new maplibregl.Marker({ element })
      .setLngLat([spot.longitude, spot.latitude])
      .setPopup(popup)
      .addTo(map);
    markers.set(spot.id, { spot, marker, popup, favoriteButton, distance: content.querySelector(".fishing-popup-distance"), visible: true });

    const focusMarker = () => element.focus({ preventScroll: true });

    // Avoid toggling twice through native button activation and MapLibre keypress.
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) marker.togglePopup();
      }
    });

    popup.on("open", () => {
      if (activePopup && activePopup !== popup) activePopup.remove();
      activePopup = popup;
      activeSpot = spot;
      element.setAttribute("aria-expanded", "true");
      fitActivePopup();
      if (!popup.isOpen()) return;
      if (typeof loadSpotWeather === "function") {
        loadSpotWeather(spot, content.querySelector(".fishing-popup-weather"), () => {
          if (popup.isOpen()) fitFishingSpotPopup(map, popup, spot);
        });
      }
      if (typeof loadSpotTides === "function") {
        stopTides = loadSpotTides(spot, content.querySelector(".fishing-popup-tides"), () => {
          if (popup.isOpen()) fitFishingSpotPopup(map, popup, spot);
        });
      }

      const dialog = popup.getElement();
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-labelledby", `fishing-spot-title-${spot.id}`);
      dialog.querySelector(".fishing-popup-details").scrollTop = 0;
      const closeButton = dialog.querySelector(".maplibregl-popup-close-button");
      closeButton.addEventListener("click", focusMarker);
      closeButton.focus({ preventScroll: true });
      dialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          popup.remove();
          focusMarker();
        }
      });
    });

    popup.on("close", () => {
      stopTides?.();
      stopTides = null;
      element.setAttribute("aria-expanded", "false");
      if (activePopup === popup) {
        activePopup = null;
        activeSpot = null;
      }
    });
  }

  if (favoriteStore) {
    updateFavoriteMarkers();
    favoriteStore.subscribe(updateFavoriteMarkers);
  }

  let locationMarker = null;
  return {
    showLocation(position) {
      cancelPendingFocus();
      activePopup?.remove();
      map.stop();
      if (!locationMarker) {
        const element = document.createElement("div");
        element.className = "current-location-marker";
        element.setAttribute("role", "img");
        locationMarker = new maplibregl.Marker({ element })
          .setLngLat([position.longitude, position.latitude]).addTo(map);
      }
      const label = `현재 위치 · ${locationAccuracyLabel(position)}`;
      locationMarker.getElement().setAttribute("aria-label", label);
      locationMarker.getElement().title = label;
      locationMarker.setLngLat([position.longitude, position.latitude]);
      for (const entry of markers.values()) {
        entry.distance.textContent = `현재 위치에서 ${formatLocationDistance(haversineDistanceMeters(position, entry.spot))} (직선)`;
        entry.distance.hidden = false;
      }
      map.flyTo({
        center: [position.longitude, position.latitude],
        zoom: 11,
        bearing: 0,
        pitch: 0,
        duration: 650,
      });
    },
    renderMarkers(spots) {
      cancelPendingFocus();
      const visibleIds = new Set(spots.map(spot => spot.id));
      for (const [id, entry] of markers) {
        const visible = visibleIds.has(id);
        if (entry.visible === visible) continue;
        if (visible) entry.marker.addTo(map);
        else entry.marker.remove();
        entry.visible = visible;
      }
    },
    focusSpot(id) {
      const entry = markers.get(id);
      if (!entry?.visible) return;
      cancelPendingFocus();
      activePopup?.remove();
      map.stop();
      map.getContainer().scrollIntoView({ block: "nearest" });
      const openPopup = () => {
        pendingFocus = null;
        if (entry.visible && !entry.popup.isOpen()) entry.marker.togglePopup();
      };
      pendingFocus = openPopup;
      map.once("moveend", openPopup);
      map.flyTo({
        center: [entry.spot.longitude, entry.spot.latitude],
        zoom: Math.max(map.getZoom(), 13),
        duration: 650,
      });
      if (pendingFocus === openPopup && !map.isMoving()) {
        map.off("moveend", openPopup);
        openPopup();
      }
    },
    resetView() {
      cancelPendingFocus();
      activePopup?.remove();
      map.stop();
      map.flyTo({ ...getJejuOverviewCamera(map), bearing: 0, pitch: 0, duration: 650 });
    },
  };
}

function getJejuOverviewCamera(map) {
  const camera = map.cameraForBounds(
    [[126.13, 33.12], [126.97, 33.64]],
    { padding: 24, maxZoom: 9.2 }
  );
  return { center: [126.55, 33.38], zoom: camera?.zoom ?? 8.5 };
}

async function initializeJejuMap() {
  const mapElement = document.querySelector("#jeju-map");
  const mapStatus = document.querySelector(".map-status");

  if (!mapElement || !mapStatus) {
    return;
  }

  const errorMessage = "지도를 불러오지 못했습니다. 인터넷 연결과 브라우저 설정을 확인해 주세요.";
  let mapLoaded = false;
  mapElement.setAttribute("aria-busy", "true");

  const reportMapError = () => {
    mapStatus.textContent = errorMessage;
    mapElement.setAttribute("aria-busy", "false");
    const count = document.querySelector(".spot-result-count");
    if (count) count.textContent = "지도를 불러오지 못했습니다.";
  };

  const loadingTimeout = window.setTimeout(() => {
    if (!mapLoaded) {
      reportMapError();
    }
  }, 20000);

  try {
    const maplibregl = await import(
      "https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.mjs"
    );

    const map = new maplibregl.Map({
      container: mapElement,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [126.55, 33.38],
      zoom: 8.5,
      maxZoom: 18,
      attributionControl: { compact: false },
      dragRotate: false,
      touchPitch: false,
      locale: {
        "Map.Title": "제주도 지도",
        "NavigationControl.ZoomIn": "지도 확대",
        "NavigationControl.ZoomOut": "지도 축소",
        "AttributionControl.ToggleAttribution": "지도 출처 표시",
        "Popup.Close": "정보창 닫기",
      },
    });

    // Keep the island in view on mobile without changing the initial center.
    map.jumpTo(getJejuOverviewCamera(map));
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.once("style.load", () => {
      if (map.getLayer("water")) {
        map.setPaintProperty("water", "fill-color", "#c1dce9");
      }
    });

    map.once("load", () => {
      mapLoaded = true;
      window.clearTimeout(loadingTimeout);
      mapStatus.hidden = true;
      mapElement.setAttribute("aria-busy", "false");
      const markers = addFishingSpotMarkers(map, maplibregl);
      const location = typeof initializeLocationControls === "function" ? initializeLocationControls(markers) : null;
      if (typeof initializeSpotControls === "function") initializeSpotControls(markers, favoriteStore, location);
      else {
        const count = document.querySelector(".spot-result-count");
        if (count) count.textContent = "검색을 불러오지 못했습니다.";
      }
    });

    map.on("error", () => {
      if (!mapLoaded) {
        window.clearTimeout(loadingTimeout);
        reportMapError();
      }
    });
  } catch {
    window.clearTimeout(loadingTimeout);
    reportMapError();
  }
}

initializeJejuMap();
