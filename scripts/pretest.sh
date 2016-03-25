#!/bin/bash

if [ -f db/test.sqlite3 ]
then
    echo "Deleting db/test.sqlite3..."
    rm db/test.sqlite3
fi

sqlite3 db/test.sqlite3 < db/schema.sql &&
    sqlite3 db/test.sqlite3 < db/seeds.sql &&
    echo "db/test.sqlite3 created and seeded. :>"
