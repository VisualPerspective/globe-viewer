# Globe Viewer
![Globe Viewer Example](/demo.jpg?raw=true)

Renders the globe in different ways using WebGL. Uses fixed data sources for now, though this is meant as a base for visualizations that add other data sets.

## Installing and Running

Requires a recent version of nodejs and [brunch](http://brunch.io/)

To install:
```
npm install
```

To run:
```
brunch watch --server
```

The viewer should now be available at `http://localhost:3333`

## Data Sources

##### Land color (data/color-\*)
Natural Earth Cross Blended Hypsometry
http://www.naturalearthdata.com/downloads/10m-cross-blend-hypso/cross-blended-hypso/

##### Topography and bathymetry (data/topo-bathy-\*)
Blue Marble
http://visibleearth.nasa.gov/view_cat.php?categoryID=1484

##### Night Sky Lights
Blue Marble
http://visibleearth.nasa.gov/view_cat.php?categoryID=1484

##### Mask for Land vs Water (data/landmask-\*)
Natural Earth Physical Vectors
http://www.naturalearthdata.com/downloads/10m-physical-vectors/

Combined and processed using Blender with https://github.com/domlysz/BlenderGIS

## Other Globe Visualizations / Platforms on the Web

https://github.com/dataarts/webgl-globe

https://cesiumjs.org/

https://earth.nullschool.net/

http://hint.fm/wind/

http://alteredqualia.com/xg/examples/earth_bathymetry.html

http://alteredqualia.com/xg/examples/earth_seasons.html
