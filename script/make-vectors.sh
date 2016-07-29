# based on https://github.com/cambecc/earth
mkdir -p tmpdata
cd tmpdata

# land
if [ ! -f ne_50m_land.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/physical/ne_50m_land.zip" -o ne_50m_land.zip
fi
unzip -o ne_50m_land.zip

# lakes
if [ ! -f ne_50m_lakes.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/physical/ne_50m_lakes.zip" -o ne_50m_lakes.zip
fi
unzip -o ne_50m_lakes.zip

# rivers
if [ ! -f ne_50m_rivers_lake_centerlines_scale_rank.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/physical/ne_50m_rivers_lake_centerlines_scale_rank.zip" -o ne_50m_rivers_lake_centerlines_scale_rank.zip
fi
unzip -o ne_50m_rivers_lake_centerlines_scale_rank.zip

# countries
if [ ! -f ne_50m_admin_0_countries.zip ]; then
  curl "http://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip" -o ne_50m_admin_0_countries.zip
fi
unzip -o ne_50m_admin_0_countries.zip

topojson --simplify-proportion 0.2 -o vectors.json -- land=ne_50m_land.shp lakes=ne_50m_lakes.shp rivers=ne_50m_rivers_lake_centerlines_scale_rank.shp countries=ne_50m_admin_0_countries.shp oceans=ne_50m_ocean.shp

cp vectors.json ../app/assets/data/
