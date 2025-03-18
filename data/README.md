# Sample Database

This directory contains a sample database that can be used for development and testing purposes.

## Available Database

### Pagila
A comprehensive sample database modeling a DVD rental store. Originally based on the Sakila sample database for MySQL, Pagila provides a realistic dataset for testing complex queries and business logic.

- Location: `./sample_databases/pagila/`
- Size: ~100MB
- Tables: 15
- Features:
  - Complex relationships between tables
  - Variety of data types
  - Realistic business scenarios
  - Temporal data
  - Geographic data

## Schema Overview
The database includes tables for:
- Films and film categories
- Actors and their film appearances
- Stores and staff
- Customers and rentals
- Addresses and locations

## How to Use

1. Create a new database (if needed):
```bash
createdb your_database_name
```

2. Import the schema and data using psql:
```bash
# Import schema first
psql -U your_username -d your_database -f data/sample_databases/pagila/pagila-schema.sql

# Then import data
psql -U your_username -d your_database -f data/sample_databases/pagila/pagila-data.sql
```

## Notes
- This database is provided for testing and development purposes only
- Data is fictional and should not be used in production
- Original source: https://github.com/devrimgunduz/pagila
- Licensed under the PostgreSQL License

## Useful Queries
Here are some example queries to get you started:
```sql
-- Get all films with their categories
SELECT f.title, c.name as category
FROM film f
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id;

-- Find top 10 most rented films
SELECT f.title, COUNT(*) as rental_count
FROM film f
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
GROUP BY f.title
ORDER BY rental_count DESC
LIMIT 10;
```
```

The `.gitattributes` file suggestion remains the same:
```gitattributes
*.sql text eol=lf
```

And here's a simplified import script:
```bash
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
```

This revised structure is cleaner and more focused, making it easier for developers to understand and use the sample database. The README now provides more detailed information about Pagila specifically, along with some useful example queries to help developers get started.