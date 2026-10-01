const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/script.js", ["script.js", "text/javascript; charset=utf-8"]],
  ["/fishing-spots.js", ["fishing-spots.js", "text/javascript; charset=utf-8"]],
  ["/assets/jeju-coast.jpg", ["assets/jeju-coast.jpg", "image/jpeg"]],
]);

http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:8080");
  const file = files.get(url.pathname);

  if (!file || !["GET", "HEAD"].includes(request.method)) {
    response.writeHead(404);
    response.end();
    return;
  }

  response.writeHead(200, { "Content-Type": file[1] });
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = fs.createReadStream(path.join(__dirname, file[0]));
  stream.on("error", () => response.destroy());
  stream.pipe(response);
}).listen(8080, "127.0.0.1", () => {
  console.log("Jeju Fishing Map: http://127.0.0.1:8080");
});
