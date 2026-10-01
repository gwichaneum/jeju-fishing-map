const yearElement = document.querySelector("[data-current-year]");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
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
