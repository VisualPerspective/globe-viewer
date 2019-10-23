# based on https://github.com/cambecc/earth
mkdir -p tmpdata
cd tmpdata

# land
if [ ! -f ne_50m_land.zip ]; then
  curl -L "http://naciscdn.org/naturalearth/50m/physical/ne_50m_land.zip" -o ne_50m_land.zip
fi
unzip -o ne_50m_land.zip

# lakes
if [ ! -f ne_50m_lakes.zip ]; then
  curl -L "http://naciscdn.org/naturalearth/50m/physical/ne_50m_lakes.zip" -o ne_50m_lakes.zip
fi
unzip -o ne_50m_lakes.zip

# rivers
if [ ! -f ne_50m_rivers_lake_centerlines_scale_rank.zip ]; then
  curl -L "http://naciscdn.org/naturalearth/50m/physical/ne_50m_rivers_lake_centerlines_scale_rank.zip" -o ne_50m_rivers_lake_centerlines_scale_rank.zip
fi
unzip -o ne_50m_rivers_lake_centerlines_scale_rank.zip


# countries
if [ ! -f ne_50m_admin_0_countries.zip ]; then
  curl -L "http://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip" -o ne_50m_admin_0_countries.zip
fi
unzip -o ne_50m_admin_0_countries.zip

mkdir -p ../app/assets/data/

geo2topo -q 1e5 -n\
  countries=<( \
    shp2json -n ne_50m_admin_0_countries.shp \
      | ndjson-map 'i = d.properties.iso_n3, d.id = i === "-99" ? undefined : i, delete d.properties, d' \
      | geostitch -n \
  ) \
  land=<( \
    shp2json -n ne_50m_land.shp \
      | geostitch -n \
  ) \
  lakes=<( \
    shp2json -n ne_50m_lakes.shp \
      | geostitch -n \
  ) \
  rivers=<( \
    shp2json -n ne_50m_rivers_lake_centerlines_scale_rank.shp \
      | geostitch -n \
  ) \
  > ../app/assets/data/vectors.json

