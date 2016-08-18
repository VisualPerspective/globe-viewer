#! /bin/bash

mkdir -p tmpdata
cd tmpdata

# Lights
if [ ! -f nightearth.gif ]; then
  curl "http://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/nightearth.gif" -o nightearth.gif
fi
convert nightearth.gif -resize 4096x4096\! lights-4096.png
cp lights-4096.png ../app/assets/data/


# Color data

if [ ! -f HYP_HR.zip ]; then
  curl "http://naciscdn.org/naturalearth/10m/raster/HYP_HR.zip" -o HYP_HR.zip
fi
unzip -o HYP_HR.zip

convert HYP_HR/HYP_HR.tif -resize 4096x4096\! -fx "u * 1.2 - 0.2" -quality 90 color-4096.jpg
cp color-4096.jpg ../app/assets/data/


# Heightmaps

if [ ! -f gebco_08_rev_elev_21600x10800.png ]; then
  curl "http://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73934/gebco_08_rev_elev_21600x10800.png" -o gebco_08_rev_elev_21600x10800.png
fi

if [ ! -f gebco_08_rev_bath_21600x10800.png ]; then
  curl "http://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73963/gebco_08_rev_bath_21600x10800.png" -o gebco_08_rev_bath_21600x10800.png
fi

# Convert to 16 bit
convert gebco_08_rev_elev_21600x10800.png -resize 4096x4096\! -compress RLE -depth 16 -type Grayscale -define tiff:bits-per-sample topo-16bit.tiff
convert gebco_08_rev_bath_21600x10800.png -resize 4096x4096\! -compress RLE -depth 16 -type Grayscale -define tiff:bits-per-sample bathy-16bit.tiff

# Change topo and bathy levels to map to one continuous ramp.
# Highest point, everest is 8838 meters above sea level.
# Lowest, Challenger Deep is 11034 meters below sea level.
# Scale such that sea level is 0.5, meaning Everest will be 0.9
# (11034 + 8838) / (11034 * 2) = 0.9
convert topo-16bit.tiff +level 50%,90% topo-16bit.tiff
convert bathy-16bit.tiff +level 0,50% bathy-16bit.tiff

convert topo-16bit.tiff bathy-16bit.tiff \
  -fx "abs(0.5 - u) > abs(0.5 - v) ? u : v" \
  topo-bathy-16bit.png

convert topo-bathy-16bit.png -depth 8 -quality 95 topo-bathy-4096.jpg
convert topo-bathy-16bit.png -resize 128x128\! -depth 8 -quality 95 topo-bathy-128.jpg

cp topo-bathy-4096.jpg ../app/assets/data/
cp topo-bathy-128.jpg ../app/assets/data/
