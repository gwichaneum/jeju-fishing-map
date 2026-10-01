# jeju-fishing-map
Jeju fishing spot map created with AI vibe coding

## Run Locally

Run `node serve.cjs` from the project folder, then open http://127.0.0.1:8080.
No build step or API key is required. An internet connection is needed for the
MapLibre CDN and the OpenFreeMap Liberty style, vector tiles, and fonts.

## Sample Fishing Spots

`fishing-spots.js` holds ten static sample points. Names, coordinates, and sample
fish are referenced from [Badatime](https://www.badatime.com/67/spots).
Jeju Port uses the listed red-lighthouse point; Hallim Port uses its outer
breakwater point. Regional labels are shortened where appropriate.
Descriptions are original summaries. No live Badatime requests are made.

Coordinates are for map display, not navigation or confirmation of permitted
access. The sample fish list does not describe current catches or conditions.
