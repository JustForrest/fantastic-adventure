#!/bin/bash
# import_pagila.sh
DB_NAME=$1

if [ -z "$DB_NAME" ]; then
    echo "Usage: ./import_pagila.sh <database_name>"
    exit 1
fi

echo "Importing Pagila schema..."
psql -U postgres -d "$DB_NAME" -f data/sample_databases/pagila/pagila-schema.sql

echo "Importing Pagila data..."
psql -U postgres -d "$DB_NAME" -f data/sample_databases/pagila/pagila-data.sql

echo "Import complete!"
