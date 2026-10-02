const express = require("express");
const path = require("node:path");
const dotenv = require("dotenv");
const { createTideService, TideError } = require("./server/tide-service.cjs");

const staticFiles = new Map([
  ["/", "index.html"], ["/index.html", "index.html"],
  ...["styles.css", "script.js", "spot-filters.js", "favorites.js", "location.js", "weather.js",
    "tide-utils.js", "tides.js", "fishing-spots.js", "restrooms.js"].map(file => [`/${file}`, file]),
  ...["jeju-coast.jpg", "search.svg", "rotate-ccw.svg", "heart.svg", "heart-filled.svg",
    "locate-fixed.svg", "map.svg"].map(file => [`/assets/${file}`, `assets/${file}`]),
]);

function createApp({ tideService = createTideService() } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  app.use((_request, response, next) => { response.set("X-Content-Type-Options", "nosniff"); next(); });
  app.get("/api/tides", async (request, response) => {
    response.set("Cache-Control", "no-store");
    if (request.method !== "GET") return response.status(405).json({ error: { code: "METHOD_NOT_ALLOWED" } });
    const { station, date } = request.query;
    if (Object.keys(request.query).some(key => !["station", "date"].includes(key))
      || typeof station !== "string" || typeof date !== "string") {
      return response.status(400).json({ error: { code: "INVALID_REQUEST", message: "지점과 날짜를 확인해 주세요." } });
    }
    try { response.json(await tideService.request(station, date)); }
    catch (error) {
      const known = error instanceof TideError;
      response.status(known ? error.status : 502).json({ error: {
        code: known ? error.code : "UPSTREAM_ERROR", message: "현재 공식 물때 정보를 불러올 수 없습니다.",
      } });
    }
  });
  // Allowlist only browser assets, never the project directory or secret/config files.
  app.use((request, response, next) => {
    const file = staticFiles.get(request.path);
    if (!file || !["GET", "HEAD"].includes(request.method)) return next();
    response.sendFile(path.join(__dirname, file));
  });
  app.use((_request, response) => response.status(404).json({ error: { code: "NOT_FOUND" } }));
  app.use((_error, _request, response, _next) => {
    if (!response.headersSent) response.status(500).json({ error: { code: "SERVER_ERROR" } });
  });
  return app;
}

function startServer() {
  const env = dotenv.config({ path: path.join(__dirname, ".env"), quiet: true, processEnv: {} }).parsed || {};
  const tideService = createTideService({ serviceKey: env.DATA_GO_KR_SERVICE_KEY || "" });
  if (!tideService.configured) console.warn("DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.");
  const port = Number(process.env.PORT) || 8080;
  const host = process.env.HOST || "127.0.0.1";
  const server = createApp({ tideService }).listen(port, host, () => {
    console.log(`Jeju Fishing Map: http://${host}:${port}`);
  });
  server.on("error", () => { console.error("서버를 시작하지 못했습니다. 포트 사용 여부를 확인해 주세요."); process.exitCode = 1; });
  return server;
}

if (require.main === module) startServer();
module.exports = { createApp, startServer };
