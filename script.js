const yearElement = document.querySelector("[data-current-year]");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function addFishingSpotMarkers(map, maplibregl) {
  if (typeof fishingSpots === "undefined") {
    return;
  }

  let activePopup = null;

  for (const spot of fishingSpots) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "fishing-marker";
    element.title = spot.name;
    element.setAttribute("aria-label", `${spot.name} 정보 보기`);
    element.setAttribute("aria-expanded", "false");
    element.setAttribute("aria-haspopup", "dialog");

    const dot = document.createElement("span");
    dot.className = "fishing-marker-dot";
    dot.setAttribute("aria-hidden", "true");
    element.append(dot);

    const content = document.createElement("div");
    const name = document.createElement("h2");
    name.className = "fishing-popup-name";
    name.id = `fishing-spot-title-${spot.id}`;
    name.textContent = spot.name;

    const region = document.createElement("p");
    region.className = "fishing-popup-region";
    region.textContent = spot.region;

    const type = document.createElement("p");
    type.className = "fishing-popup-type";
    type.textContent = `${spot.type} 낚시`;
    content.append(name, region, type);

    const popup = new maplibregl.Popup({
      className: "fishing-popup",
      offset: 16,
      maxWidth: "240px",
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
      element.setAttribute("aria-expanded", "true");

      const dialog = popup.getElement();
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-labelledby", name.id);
      dialog.querySelector(".maplibregl-popup-close-button")
        .addEventListener("click", focusMarker);
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
      if (activePopup === popup) activePopup = null;
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
