#!/bin/bash
DB_NAME=${1:-fantastic_adventure}

echo "Setting up database: $DB_NAME"

# Run migrations
npm run db:migrate

# Seed basic data
npm run db:seed

# Check if pagila import is requested
if [ "$2" = "--with-pagila" ]; then
  echo "Importing Pagila sample database..."
  ./import_pagila.sh "$DB_NAME"
fi

echo "Database initialization complete!" 