#!/bin/bash

if [ -f db/$1.sqlite3 ]
then
    echo "Deleting db/$1.sqlite3..."
    rm db/$1.sqlite3
fi

sqlite3 db/$1.sqlite3 < db/schema.sql &&
    sqlite3 db/$1.sqlite3 < db/seeds.sql &&
    echo "db/$1.sqlite3 created and seeded. :)"
