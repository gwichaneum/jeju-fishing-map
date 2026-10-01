function formatLocationDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return "";
  const rounded = Math.round(meters);
  return rounded < 1000 ? `${rounded}m` : `${(meters / 1000).toFixed(1)}km`;
}

function getNearestFishingSpots(position, spots, limit = 5) {
  if (!position || !hasValidCoordinates(position)) return [];
  return spots.filter(isDisplayableFishingSpot)
    .map(spot => ({ spot, distanceMeters: haversineDistanceMeters(position, spot) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters || a.spot.id - b.spot.id)
    .slice(0, Math.max(0, limit));
}

function locationAccuracyLabel(position) {
  if (!Number.isFinite(position.accuracy)) return "정확도 정보 없음";
  const accuracy = formatLocationDistance(Math.max(1, position.accuracy));
  return `정확도 약 ${accuracy}${position.accuracy > 100 ? " · 오차가 클 수 있습니다." : ""}`;
}

// Location exists only in this page's memory; resolving the browser API is lazy.
function createLocationStore(getEnvironment = () => ({
  secure: window.isSecureContext,
  geolocation: navigator.geolocation,
})) {
  let position = null;
  let phase = "idle";
  let message = "";
  const listeners = new Set();
  const notify = () => { for (const listener of listeners) listener(); };
  const fail = code => {
    phase = "error";
    message = {
      insecure: "위치 확인은 HTTPS 또는 localhost에서 가능합니다. 실행 주소를 확인해 주세요.",
      unsupported: "이 브라우저는 현재 위치 확인을 지원하지 않습니다.",
      1: "위치 권한이 필요합니다. 브라우저에서 위치 사용을 허용해 주세요.",
      2: "현재 위치를 확인할 수 없습니다. 기기의 위치 설정을 확인하고 다시 시도해 주세요.",
      3: "위치 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
    }[code] || "위치를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    if (position) message += " 이전에 확인한 위치를 유지합니다.";
    notify();
  };
  return {
    getPosition: () => position,
    getState: () => ({ phase, message }),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    request() {
      if (phase === "requesting") return;
      try {
        const environment = getEnvironment();
        if (!environment.secure) { fail("insecure"); return; }
        if (typeof environment.geolocation?.getCurrentPosition !== "function") {
          fail("unsupported"); return;
        }
        phase = "requesting";
        message = "현재 위치를 확인하는 중입니다.";
        notify();
        environment.geolocation.getCurrentPosition(result => {
          if (!result?.coords || !hasValidCoordinates(result.coords)) { fail(2); return; }
          position = Object.freeze({
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
            accuracy: Number.isFinite(result.coords.accuracy) && result.coords.accuracy >= 0
              ? result.coords.accuracy : null,
          });
          phase = "ready";
          message = `현재 위치 · ${locationAccuracyLabel(position)}`;
          notify();
        }, error => fail(error?.code), {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      } catch {
        fail(2);
      }
    },
  };
}

function initializeLocationControls(markerController) {
  const button = document.querySelector(".location-request");
  const overview = document.querySelector(".location-overview");
  const status = document.querySelector(".location-status");
  const panel = document.querySelector(".nearby-panel");
  const list = document.querySelector(".nearby-list");
  const empty = document.querySelector(".nearby-empty");
  if (!button || !overview || !status || !panel || !list || !empty) return null;
  const store = createLocationStore();
  let visibleSpots = fishingSpots.filter(isDisplayableFishingSpot);
  let previousPosition = null;
  button.disabled = false;
  overview.disabled = false;
  button.addEventListener("click", () => store.request());
  overview.addEventListener("click", () => markerController.resetView());

  function renderNearby() {
    const position = store.getPosition();
    panel.hidden = !position;
    if (!position) return;
    const nearby = getNearestFishingSpots(position, visibleSpots);
    const focusedId = list.contains(document.activeElement) ? document.activeElement.dataset.spotId : null;
    list.replaceChildren();
    for (const { spot, distanceMeters } of nearby) {
      const item = document.createElement("li");
      const result = document.createElement("button");
      result.type = "button";
      result.className = "nearby-result";
      result.dataset.spotId = spot.id;
      const name = document.createElement("span");
      name.className = "nearby-name";
      name.textContent = spot.name;
      const distance = document.createElement("span");
      distance.className = "nearby-distance";
      distance.textContent = formatLocationDistance(distanceMeters);
      result.append(name, distance);
      result.addEventListener("click", () => markerController.focusSpot(spot.id));
      item.append(result);
      list.append(item);
    }
    empty.hidden = nearby.length !== 0;
    // Removing a favorite can also remove its focused nearby result.
    if (focusedId) (list.querySelector(`[data-spot-id="${focusedId}"]`) || panel.querySelector("summary"))
      .focus({ preventScroll: true });
  }

  store.subscribe(() => {
    const { phase, message } = store.getState();
    button.disabled = phase === "requesting";
    button.setAttribute("aria-busy", String(phase === "requesting"));
    status.textContent = message;
    status.hidden = !message;
    status.dataset.state = phase;
    const position = store.getPosition();
    if (position && position !== previousPosition) {
      previousPosition = position;
      markerController.showLocation(position);
      renderNearby();
    }
  });
  return {
    getPosition: store.getPosition,
    subscribe: store.subscribe,
    setSpots(spots) { visibleSpots = spots; renderNearby(); },
  };
}
