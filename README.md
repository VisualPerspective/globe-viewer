# Globe Viewer
[![Globe Viewer Example](/demo.jpg?raw=true)](http://k9.github.com/globe-viewer/index.html)

Renders the globe in different ways using WebGL ([Live Demo](http://k9.github.com/globe-viewer/index.html)). Uses fixed data sources for now, though this is meant as a base for visualizations that add other data sets.

## Installing and Running

Requires:

* a recent version of nodejs and yarn
* topojson (npm install -g topojson)
* ImageMagick

To install, clone the repo and:
```
npm install
chmod +x script/make-vectors.sh
./script/make-vectors.sh
```

To run:
```
brunch watch --server
```

The viewer should now be available at `http://localhost:3333`

## Data Sources

##### Land color (app/assets/data/color-\*)
Natural Earth Cross Blended Hypsometry
http://www.naturalearthdata.com/downloads/10m-cross-blend-hypso/cross-blended-hypso/

##### Topography and bathymetry (app/assets/data/topo-bathy-\*)
Blue Marble
http://visibleearth.nasa.gov/view_cat.php?categoryID=1484

##### Night Sky Lights (app/assets/data/lights-\*)
Blue Marble
http://visibleearth.nasa.gov/view_cat.php?categoryID=1484

##### Land, Ocean, Rivers, and Borders (app/assets/data/vectors.json)
Natural Earth Physical Vectors
http://www.naturalearthdata.com/downloads/50m-physical-vectors/

These physical vectors can be downloaded and processed
using ./scripts/make-vectors.sh The resulting json is then
drawn to an offscreen
canvas in the browser using vectorLayer.js

## Other Globe Visualizations / Platforms on the Web

https://github.com/dataarts/webgl-globe

https://cesiumjs.org/

https://earth.nullschool.net/

http://hint.fm/wind/

http://alteredqualia.com/xg/examples/earth_bathymetry.html

http://alteredqualia.com/xg/examples/earth_seasons.html
