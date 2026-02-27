# Postgres for Everything

Postges is a versatile database and in this project explored some of its features for different use cases.

## Prerequisite
- [Docker](https://docs.docker.com/get-started/get-docker/)

## Start Postgres

```bash
./start-postgres.sh
```

Connect to each database.

```bash
./connect-to-postgres.sh
./connect-to-pgvector.sh
./connect-to-postgis.sh
```

## Relational

A standard use case where data is represented as tables and joins are used to relate them together.

### Setup

Note: `user` is a special keyword and needs to be specified in double-quotes.

```sql
CREATE TABLE "user" (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

CREATE TABLE post (
    post_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE INDEX user_user_id_idx ON "user" (user_id);

INSERT INTO "user" (user_id)
VALUES (gen_random_uuid());
INSERT INTO post (post_id, user_id)
VALUES (gen_random_uuid(), (SELECT user_id FROM "user" LIMIT 1));
```

### Query

```sql
-- Post IDs and the related user IDs
SELECT
    post.post_id AS "Post ID",
    "user".user_id AS "User ID"
FROM post
JOIN "user" ON post.user_id = "user".user_id;
```
```
               Post ID                |               User ID
--------------------------------------+--------------------------------------
 d632eb7d-5564-44b1-b5fc-b80bd6e6dc5d | 8d031fde-7018-42a0-b0d6-b7e190380ddf
(1 row)
```

## Key-Value

A simple use case that uses one data point to retrieve another data point. It can be modeled using a single table and a hash index.

### Setup

```sql
CREATE SEQUENCE zipcode_seq START WITH 1;
CREATE TABLE zipcode_state (
    zipcode TEXT NOT NULL,
    state TEXT NOT NULL
);
CREATE INDEX zipcode_state_idx ON zipcode_state USING HASH (zipcode);

INSERT INTO zipcode_state (zipcode, state)
SELECT
    lpad(nextval('zipcode_seq')::text, 5, '0'),
    'State ' || floor(random() * 10 + 1)::int
FROM generate_series(1, 5);
```

### Query

```sql
-- State of the zipcode 00001
SELECT state FROM zipcode_state WHERE zipcode = '00001';
```
```
  state
---------
 State 5
(1 row)
```

## Document

A document store allows dynamic data structures compared to defining the structure upfront. The `JSONB` data type can be used here.

### Setup

```sql
CREATE TABLE product (
    product_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_details JSONB NOT NULL
);
CREATE INDEX product_product_detail_idx ON product USING GIN (product_details);

INSERT INTO product (product_details) VALUES
('{ "name": "Laptop Pro 15", "price": 1500, "category": "Electronics", "brand": "TechBrand", "specs": { "ram": "16GB", "storage": "512GB SSD" }, "in_stock": true }'),
('{ "name": "Wireless Mouse", "price": 30, "category": "Electronics", "brand": "TechBrand", "color": "Black", "in_stock": true }'),
('{ "name": "Desk Lamp", "price": 45.00, "category": "Furniture", "color": "White", "led": true, "adjustable": true }'),
('{ "name": "Backpack", "price": 60, "category": "Accessories", "brand": "UrbanGear", "capacity_liters": 20, "water_resistant": true }');
```

### Query

```sql
-- Products where the brand is TechBrand
SELECT * FROM product WHERE product_details @> '{"brand": "TechBrand"}';
```
```
              product_id              |                                                                        product_details
--------------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------
 3e160eea-8630-4bbe-bc60-45e54cf24559 | {"name": "Laptop Pro 15", "brand": "TechBrand", "price": 1500, "specs": {"ram": "16GB", "storage": "512GB SSD"}, "category": "Electronics", "in_stock": true}
 9129e83c-1380-4ccb-92d4-5ad6f4c6ae2f | {"name": "Wireless Mouse", "brand": "TechBrand", "color": "Black", "price": 30, "category": "Electronics", "in_stock": true}
(2 rows)
```

```sql
-- Name and color of products that have a color
SELECT product_details['name'] AS "Name", product_details -> 'color' AS "Color" FROM product WHERE product_details ? 'color';
```
```
       Name       |  Color
------------------+---------
 "Wireless Mouse" | "Black"
 "Desk Lamp"      | "White"
(2 rows)
```

## Vector Embedding

Vector embedding helps find results that are similar to the value being searched.
The `pgvector` extension provides the functionality to do vector embedding.

Note: pgvector provides different single-precision (VECTOR), half-precision (HALFVEC), binary (BIT), and sparse (SPARSEVEC) vectors.
Single-precision, half-precision, and sparse store continuous range, while binary only stores a 1 or 0. Sparse only stores values that are not 0.

### Setup

```sql
CREATE EXTENSION vector;
CREATE TABLE document (
    id BIGSERIAL PRIMARY KEY,
    embedding VECTOR(3),
    content TEXT NOT NULL
);
CREATE TABLE document_binary (
    id BIGSERIAL PRIMARY KEY,
    embedding BIT(3),
    content TEXT NOT NULL
);
CREATE INDEX document_embedding_l2_idx ON document USING hnsw (embedding vector_l2_ops);
CREATE INDEX document_embedding_cosine_idx ON document USING hnsw (embedding vector_cosine_ops);
CREATE INDEX document_embedding_ip_idx ON document USING hnsw (embedding vector_ip_ops);
CREATE INDEX document_embedding_l1_idx ON document USING hnsw (embedding vector_l1_ops);
CREATE INDEX document_binary_embedding_hamming_idx ON document_binary USING hnsw (embedding bit_hamming_ops);
CREATE INDEX document_binary_embedding_jaccard_idx ON document_binary USING hnsw (embedding bit_jaccard_ops);

INSERT INTO document (embedding, content) VALUES ('[1,1,0]', 'Plane'), ('[0,1,1]', 'Car'), ('[0,1,0]', 'Boat'), ('[0,0,1]', 'Submarine');
INSERT INTO document_binary (embedding, content) VALUES ('110', 'Plane'), ('011', 'Car'), ('010', 'Boat'), ('001', 'Submarine');
```

### Query

```sql
-- Comparison of metrics using vector [1,0,0]
SELECT id, content, embedding,
    embedding <-> '[1,0,0]' AS "L2 distance ([1,0,0])",
    embedding <#> '[1,0,0]' AS "Negative inner product ([1,0,0])",
    embedding <=> '[1,0,0]' AS "Cosine distance ([1,0,0])",
    embedding <+> '[1,0,0]' AS "L1 distance ([1,0,0])"
FROM document;
```
```
 id |  content  | embedding | L2 distance ([1,0,0]) | Negative inner product ([1,0,0]) | Cosine distance ([1,0,0]) | L1 distance ([1,0,0])
----+-----------+-----------+-----------------------+----------------------------------+---------------------------+-----------------------
  1 | Plane     | [1,1,0]   |                     1 |                               -1 |       0.29289321881345254 |                     1
  2 | Car       | [0,1,1]   |    1.7320508075688772 |                               -0 |                         1 |                     3
  3 | Boat      | [0,1,0]   |    1.4142135623730951 |                               -0 |                         1 |                     2
  4 | Submarine | [0,0,1]   |    1.4142135623730951 |                               -0 |                         1 |                     2
(4 rows)
```

```sql
-- Sort the documents based on the L2 distance between the embedding and the vector [1,0,0]
SELECT id, content, embedding, embedding <-> '[1,0,0]' AS "L2 distance ([1,0,0])"
FROM document
WHERE embedding <-> '[1,0,0]' < 5
ORDER BY embedding <-> '[1,0,0]'
LIMIT 5;
```
```
 id |  content  | embedding | L2 distance ([1,0,0])
----+-----------+-----------+-----------------------
  1 | Plane     | [1,1,0]   |                     1
  3 | Boat      | [0,1,0]   |    1.4142135623730951
  4 | Submarine | [0,0,1]   |    1.4142135623730951
  2 | Car       | [0,1,1]   |    1.7320508075688772
(4 rows)
```

```sql
-- Comparison of metrics using binary vector 100
SELECT id, content, embedding,
    embedding <~> '100' AS "Hamming distance (100)",
    embedding <%> '100' AS "Jaccard distance (100)"
FROM document_binary;
```
```
 id |  content  | embedding | Hamming distance (100) | Jaccard distance (100)
----+-----------+-----------+------------------------+------------------------
  1 | Plane     | 110       |                      1 |                    0.5
  2 | Car       | 011       |                      3 |                      1
  3 | Boat      | 010       |                      2 |                      1
  4 | Submarine | 001       |                      2 |                      1
(4 rows)
```

```sql
-- Sort the documents based on the Jaccard distance between the embedding and the binary vector 100
SELECT id, content, embedding, embedding <~> '100' AS "Jaccard distance (100)"
FROM document_binary
WHERE embedding <~> '100' < 5
ORDER BY embedding <~> '100'
LIMIT 5;
```
```
 id |  content  | embedding | Jaccard distance (100)
----+-----------+-----------+------------------------
  1 | Plane     | 110       |                      1
  3 | Boat      | 010       |                      2
  4 | Submarine | 001       |                      2
  2 | Car       | 011       |                      3
(4 rows)
```

## Geographic Information System (GIS)

A geographic information system can be used to find points of interes within an area or calculate the distance between two points.
The `postgis` extension adds geographic informatino system functionality to PostgreSQL.

### Setup

```sql
CREATE EXTENSION postgis;

CREATE TABLE city (
    name TEXT NOT NULL,
    location GEOMETRY NOT NULL
);
INSERT INTO city (name, location) VALUES
('Los Angeles', 'SRID=4326;POINT(-118.2426 34.0549)'),
('Chicago', 'SRID=4326;POINT(-87.6324 41.8832)'),
('New York', 'SRID=4326;POINT(-74.0059 40.7127)');

CREATE TABLE shape (
    name TEXT NOT NULL,
    form GEOMETRY NOT NULL
);
INSERT INTO shape (name, form) VALUES
('small circle', ST_Buffer('POINT(0 3)', 1)),
('large circle', ST_Buffer('POINT(6 6)', 3)),
('square', 'POLYGON((0 0,0 2,2 2,2 0,0 0))'::geometry),
('rectangle', 'POLYGON((1 2,1 4,6 4,6 2,1 2))'::geometry);
```

### Query

```sql
SELECT
    city_a.name AS "city a",
    city_b.name AS "city b",
    ROUND(ST_DISTANCE(ST_Transform(city_a.location, 3857), ST_Transform(city_b.location, 3857)) * cosd(42.3521) / 1000) AS "distance (km)"
FROM city AS city_a
JOIN city AS city_b ON city_a.name < city_b.name;
```
```
   city a    |   city b    | distance (km)
-------------+-------------+---------------
 Los Angeles | New York    |          3704
 Chicago     | Los Angeles |          2648
 Chicago     | New York    |          1128
(3 rows)
```

```sql
-- Name and distance to Indianapolis in km for cities within 2000 km and and sorted by distance
SELECT
    name AS city,
    ROUND(ST_DISTANCE(ST_Transform(city.location, 3857), ST_Transform('SRID=4326;POINT(-86.1580 39.7690)', 3857)) * cosd(42.3521) / 1000) AS "distance to Indianapolis (km)"
FROM city
WHERE ST_DWithin(ST_Transform(city.location, 3857), ST_Transform('SRID=4326;POINT(-86.1580 39.7690)', 3857), 2000 * 1000)
ORDER BY ST_DISTANCE(ST_Transform(city.location, 3857), ST_Transform('SRID=4326;POINT(-86.1580 39.7690)', 3857)) * cosd(42.3521) / 1000;
```
```
   city   | distance to Indianapolis (km)
----------+-------------------------------
 Chicago  |                           260
 New York |                          1005
(2 rows)
```

Shapes setup

![Shapes](/2026/postgres-for-everything/assets/shapes.drawio.png)

[Shapes setup file](https://app.diagrams.net/?title=shapes#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2026%2Fpostgres-for-everything%2Fassets%2Fshapes.drawio)

```sql
-- Shapes that intersect with the point x=1 and y=2
SELECT name
FROM shape
WHERE ST_Intersects('POINT(1 2)'::geometry, form);
```
```
   name
-----------
 square
 rectangle
(2 rows)
```

```sql
-- Total area of the circles
SELECT SUM(ST_Area(form)) AS area
FROM shape
WHERE name LIKE '%circle';
```
```
       area
-------------------
 31.21445152258051
(1 row)
```

## Queue

A queue can be implemented using a limit of 1 and a row lock for update.

### Setup

```sql
CREATE TABLE queue (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE
);

INSERT INTO queue (message) VALUES ('message 1'), ('message 2'), ('message 3');
```

### Query

```sql
BEGIN;
SELECT * FROM queue WHERE processed = FALSE LIMIT 1 FOR UPDATE SKIP LOCKED;
```
```
 id |  message  | processed
----+-----------+-----------
  1 | message 1 | f
(1 row)
```
```sql
-- From a different session
BEGIN;
SELECT * FROM queue WHERE processed = FALSE LIMIT 1 FOR UPDATE SKIP LOCKED;
```
```
 id |  message  | processed
----+-----------+-----------
  2 | message 2 | f
(1 row)
```

Cleanup both sessions:

```sql
ROLLBACK;
```

## Timeseries

https://github.com/timescale/timescaledb

## Stop Postgres

```bash
./stop-postgres.sh
```
