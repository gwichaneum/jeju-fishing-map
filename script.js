const yearElement = document.querySelector("[data-current-year]");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function isDisplayableFishingSpot(spot) {
  return spot.kind === "fishing-spot"
    && spot.needsVerification === false
    && Number.isFinite(spot.latitude)
    && Number.isFinite(spot.longitude)
    && spot.latitude >= -90 && spot.latitude <= 90
    && spot.longitude >= -180 && spot.longitude <= 180;
}

function createFishingSpotPopupContent(spot) {
  const content = document.createElement("div");
  const header = document.createElement("div");
  header.className = "fishing-popup-header";

  const name = document.createElement("h2");
  name.className = "fishing-popup-name";
  name.id = `fishing-spot-title-${spot.id}`;
  name.textContent = spot.name;

  const region = document.createElement("p");
  region.className = "fishing-popup-region";
  region.textContent = spot.region;

  const type = document.createElement("p");
  type.className = "fishing-popup-type";
  type.textContent = `유형: ${spot.category}`;
  header.append(name, region, type);

  const details = document.createElement("div");
  details.className = "fishing-popup-details";
  const fields = document.createElement("dl");

  for (const [key, label, value] of [
    ["note", "내 메모", spot.userNote],
    ["species", "확인된 주요 어종", spot.species.join(" / ")],
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

  if (spot.fishingInfoSource) {
    const source = document.createElement("p");
    source.className = "fishing-popup-source";
    source.append("어종·방법 출처: ");
    const url = new URL(spot.fishingInfoSource.url);
    if (url.protocol === "https:" || url.protocol === "http:") {
      const link = document.createElement("a");
      link.href = url.href;
      link.textContent = spot.fishingInfoSource.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      source.append(link);
    }
    details.append(source);
  }

  content.append(header, details);
  return content;
}

function fitFishingSpotPopup(map, popup, spot) {
  const point = map.project([spot.longitude, spot.latitude]);
  const { clientWidth: width, clientHeight: height } = map.getContainer();
  if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
    popup.remove();
    return;
  }

  const dialog = popup.getElement();
  const header = dialog.querySelector(".fishing-popup-header");
  const details = dialog.querySelector(".fishing-popup-details");
  const above = point.y - 32;
  const below = height - point.y - 32;
  const anchor = above >= below ? "bottom" : "top";
  details.style.maxHeight = `${Math.max(40, Math.max(above, below) - header.offsetHeight - 48)}px`;

  // Keep wide, scrollable popups within a narrow map without moving its camera.
  const halfWidth = dialog.offsetWidth / 2;
  const center = Math.max(halfWidth + 16, Math.min(width - halfWidth - 16, point.x));
  popup.options.anchor = anchor;
  popup.setOffset([center - point.x, anchor === "bottom" ? -16 : 16]);
}

function addFishingSpotMarkers(map, maplibregl) {
  if (typeof fishingSpots === "undefined") {
    return;
  }

  let activePopup = null;
  let activeSpot = null;

  const fitActivePopup = () => {
    if (activePopup) fitFishingSpotPopup(map, activePopup, activeSpot);
  };
  map.on("move", fitActivePopup);
  map.on("resize", fitActivePopup);

  for (const spot of fishingSpots.filter(isDisplayableFishingSpot)) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "fishing-marker";
    element.dataset.spotId = spot.id;
    element.title = spot.name;
    element.setAttribute("aria-label", `${spot.name} 정보 보기`);
    element.setAttribute("aria-expanded", "false");
    element.setAttribute("aria-haspopup", "dialog");

    const dot = document.createElement("span");
    dot.className = "fishing-marker-dot";
    dot.setAttribute("aria-hidden", "true");
    element.append(dot);

    const content = createFishingSpotPopupContent(spot);

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
      element.setAttribute("aria-expanded", "false");
      if (activePopup === popup) {
        activePopup = null;
        activeSpot = null;
      }
    });
  }
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

  const loadingTimeout = window.setTimeout(() => {
    if (!mapLoaded) {
      mapStatus.textContent = errorMessage;
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
    const camera = map.cameraForBounds(
      [[126.13, 33.12], [126.97, 33.64]],
      { padding: 24, maxZoom: 9.2 }
    );
    map.jumpTo({ center: [126.55, 33.38], zoom: camera?.zoom ?? 8.5 });
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
      addFishingSpotMarkers(map, maplibregl);
    });

    map.on("error", () => {
      if (!mapLoaded) {
        window.clearTimeout(loadingTimeout);
        mapStatus.textContent = errorMessage;
        mapElement.setAttribute("aria-busy", "false");
      }
    });
  } catch {
    window.clearTimeout(loadingTimeout);
    mapStatus.textContent = errorMessage;
    mapElement.setAttribute("aria-busy", "false");
  }
}

initializeJejuMap();
