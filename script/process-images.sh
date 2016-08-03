#! /bin/bash

# Convert to 16 bit
convert gebco_08_rev_elev_21600x10800.png -resize 8192x8192\! -compress RLE -depth 16 -type Grayscale -define tiff:bits-per-sample topo-16bit.tiff
convert gebco_08_rev_bath_21600x10800.png -resize 8192x8192\! -compress RLE -depth 16 -type Grayscale -define tiff:bits-per-sample bathy-16bit.tiff

# Change levels to map to one continuous ramp
# (11034 + 8838) / (11034 * 2) = 90%
convert topo-16bit.tiff +level 50%,90% topo-16bit.tiff
convert bathy-16bit.tiff +level 0,50% bathy-16bit.tiff

convert topo-16bit.tiff bathy-16bit.tiff \
  -fx "abs(0.5 - u) > abs(0.5 - v) ? u : v" \
  topo-bathy-16bit.png

convert topo-bathy-16bit.png -depth 8 -quality 95 topo-bathy-8192.jpg
convert topo-bathy-16bit.png -resize 128x128\! -depth 8 -quality 95 topo-bathy-128.jpg
