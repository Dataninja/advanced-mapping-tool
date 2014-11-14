#!/bin/bash
if which ogr2ogr; then
    echo "Municipalities per region..."
    for n in {1..20}; do ogr2ogr -f GeoJSON -where "COD_REG=$n" comuni-regioni-$n.json comuni.json; done
    echo "Provinces per region..."
    for n in {1..20}; do ogr2ogr -f GeoJSON -where "COD_REG=$n" province-regioni-$n.json province.json; done
    echo "Municipalities per province..."
    for n in {1..110}; do ogr2ogr -f GeoJSON -where "COD_PRO=$n" comuni-province-$n.json comuni.json; done
else
    echo "ogr2ogr missing, in debian please install gdal-bin package"
fi
