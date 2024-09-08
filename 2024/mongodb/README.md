# MongoDB

The steps in this document roughly follow what was presented by Net Ninja in [Complete MongoDB Tutorial](https://www.youtube.com/playlist?list=PL4cUxeGkcC9h77dJ-QJlwGlZlTd4ecZOA).

## Requirements

- [Docker](https://www.docker.com/get-started/)
- [Node.js](https://nodejs.org/en)
- cURL

## Setup

Create the `.env` file by copying the content of `.env.example`.
```bash
cp .env.example .env
```

Populate the values for `DB_USERNAME` and `DB_PASSWORD` in `.env`. Avoid using these symbols: `$ : / ? # [ ] @`.

Start the MongoDB container using docker compose
```bash
docker compose up -d
```

Load the dataset
```bash
source .env && docker exec -it mongodb-mongo-1 /bin/mongosh mongodb://${DB_USERNAME}:${DB_PASSWORD}@mongo:27017/bookstore?authSource=admin
db.books.insertMany([{ title: "The Way of Kings", author: "Brandon Sanderson", rating: 9, pages: 320, genres: ["fantasy"], reviews: [{ name: "Yoshi", body: "Great book!!!" }, { name: "mario", body: "So so" } ] },{title: "The Light Fantastic", author: "Terry Pratchett", pages: 250, rating: 6, genres: ["fantasy", "magic"], reviews: [{name:"luigi", body: "it was pretty good"}, {name: "bowser", body: "loved it!!"}]}, {title: "The Name of the Wind", "author": "Patrick Rothfuss", pages: 500, "rating": 10, genres: ["fantasy"], reviews: [{name: "peach", body: "one of my favs"}]}, {title: "The Color of Magic", "author": "Terry Pratchett", pages: 350, "rating": 8, genres: ["fantasy", "magic"], reviews: [{name: "luigi", body: "it was ok"}, {name: "bowser", body: "really good book"}]}, {title: "1984", "author": "George Orwell", pages: 300, "rating": 6, genres: ["sci-fi", "dystopian"], reviews: [{name: "peach", body: "not my cup of tea"}, {name: "mario", body: "meh"}]}])
```

Access the web interface for MongoDB at 
http://localhost:8081/db/bookstore/books.

Clean up the containers and the data volume
```bash
docker compose down
docker volume rm mongodb_mongodb
```

## CLI access

Start the MongoDB container using docker compose
```bash
docker compose up -d
```

List running containers to get the name of the MongoDB container
```bash
docker ps
```

Run the `mongosh` command inside the MongoDB container
```bash
source .env && docker exec -it mongodb-mongo-1 /bin/mongosh mongodb://${DB_USERNAME}:${DB_PASSWORD}@mongo:27017/
```

List databases
```bash
show dbs
```

Switch database
```bash
use bookstore
```

Show collections in database
```bash
show collections
```

Save a variable
```bash
var name = "yoshi"
```

Show value of a variable
```bash
name
```

Insert document
```bash
db.books.insertOne({ title: "The Color of Magic", author: "Terry Pratchett", pages: 300, rating: 7, genres: ["fantasy", "magic"] })
```

Insert many documents
```bash
db.books.insertMany([{title: "The Light Fantastic", author: "Terry Pratchett", pages: 250, rating: 6, genres: ["fantasy"]}, {title: "Dune", author: "Frank Herbert", pages: 500, rating: 10, genres: ["sci-fi", "dystopian"]}, { "title": "Name of the Wind", "author":"Patrick Rothfuss", "pages":500, "genres":["fantasy", "magical"], "rating":9 },  { "title": "The Final Empire", "author":"Brandon Sanderson", "pages":450, "genres":["fantasy", "dystopian"], "rating":8 }, { "title": "The Way of the King", "author":"Brandon Sanderson", "pages":350, "genres":["fantasy", "dystopian"], "rating":9 }, { "title": "The Call of the Weird", "author":"Louis Theroux", "pages":350, "genres":["non-fiction", "strange", "comedy"], "rating":7 }])
```

Search
```bash
db.books.find({ author: "Terry Pratchett" })

db.books.find({ author: "Terry Pratchett", rating: 7 })
```

Specify returned fields
```bash
db.books.find({ author: "Brandon Sanderson" }, { title: 1, author: 1 })
```

Return one result
```bash
db.books.findOne({ _id: ObjectId('66ddf6587e2d70dcc35e73a1') })
```

Count results
```bash
db.books.find().count()
```

Limit results
```bash
db.books.find().limit(3)
```

Sort ascending
```bash
db.books.find().sort({ title: 1 })
```

Sort descending
```bash
db.books.find().sort({ title: -1 })
```

Delete all documents
```bash
db.books.drop()
```

Insert nested document
```bash
db.books.insertOne({ title: "The Way of Kings", author: "Brandon Sanderson", rating: 9, pages: 320, genres: ["fantasy"], reviews: [{ name: "Yoshi", body: "Great book!!!" }, { name: "mario", body: "So so" } ] })
```

Insert many nested documents
```bash
db.books.insertMany([{title: "The Light Fantastic", author: "Terry Pratchett", pages: 250, rating: 7, genres: ["fantasy", "magic"], reviews: [{name:"luigi", body: "it was pretty good"}, {name: "bowser", body: "loved it!!"}]}, {title: "The Name of the Wind", "author": "Patrick Rothfuss", pages: 500, "rating": 10, genres: ["fantasy"], reviews: [{name: "peach", body: "one of my favs"}]}, {title: "The Color of Magic", "author": "Terry Pratchett", pages: 350, "rating": 8, genres: ["fantasy", "magic"], reviews: [{name: "luigi", body: "it was ok"}, {name: "bowser", body: "really good book"}]}, {title: "1984", "author": "George Orwell", pages: 300, "rating": 6, genres: ["sci-fi", "dystopian"], reviews: [{name: "peach", body: "not my cup of tea"}, {name: "mario", body: "meh"}]}])
```

### Search filters

See list of search operators at
https://www.mongodb.com/docs/manual/reference/operator/.

Greater than
```bash
db.books.find({ rating: { $gt: 7 } })
```

Match multiple conditions
```bash
db.books.find({ $or: [{ rating: 7 }, { rating: 9 }] })
```

Value in list
```bash
db.books.find({ rating: { $in: [7, 8, 9] } })
```

Value not in list
```bash
db.books.find({ rating: { $nin: [7, 8, 9] } })
```

Value contained in array
```bash
db.books.find({ genres: "fantasy" })
```

Exact array match
```bash
db.books.find({ genres: ["fantasy"] })
```

All values present in array
```bash
db.books.find({ genres: { $all: ["dystopian", "sci-fi"] } })
```

Search in nested array
```bash
db.books.find({ "reviews.name": "luigi" })
```

Delete document
```bash
db.books.deleteOne({ _id: ObjectId('66ddf6c97e2d70dcc35e73a4') })
```

Delete many documents
```bash
db.books.deleteMany({ author: "Terry Pratchett" })
```

Reset database
```bash
db.books.drop()

db.books.insertMany([{ title: "The Way of Kings", author: "Brandon Sanderson", rating: 9, pages: 320, genres: ["fantasy"], reviews: [{ name: "Yoshi", body: "Great book!!!" }, { name: "mario", body: "So so" } ] },{title: "The Light Fantastic", author: "Terry Pratchett", pages: 250, rating: 6, genres: ["fantasy", "magic"], reviews: [{name:"luigi", body: "it was pretty good"}, {name: "bowser", body: "loved it!!"}]}, {title: "The Name of the Wind", "author": "Patrick Rothfuss", pages: 500, "rating": 10, genres: ["fantasy"], reviews: [{name: "peach", body: "one of my favs"}]}, {title: "The Color of Magic", "author": "Terry Pratchett", pages: 350, "rating": 8, genres: ["fantasy", "magic"], reviews: [{name: "luigi", body: "it was ok"}, {name: "bowser", body: "really good book"}]}, {title: "1984", "author": "George Orwell", pages: 300, "rating": 6, genres: ["sci-fi", "dystopian"], reviews: [{name: "peach", body: "not my cup of tea"}, {name: "mario", body: "meh"}]}])
```

Update document
```bash
db.books.updateOne({ _id: ObjectId('66ddf7677e2d70dcc35e73ac') }, { $set: { rating: 8, pages: 360 }})
```

Update many documents
```bash
db.books.updateMany({ author: "Terry Pratchett" }, { $set: { author: "Terry Pratchet" }})
```

Update document by incrementing/decrementing a value
```bash
db.books.updateOne({ _id: ObjectId('66ddf7677e2d70dcc35e73ac') }, { $inc: { pages: 2 }})

db.books.updateOne({ _id: ObjectId('66ddf7677e2d70dcc35e73ac') }, { $inc: { pages: -2 }})
```

Remove from array
```bash
db.books.updateOne({ _id: ObjectId('66ddf7677e2d70dcc35e73ac') }, { $pull: { genres: "dystopian" }})
```

Add to array
```bash
db.books.updateOne({ _id: ObjectId('66ddf7677e2d70dcc35e73ac') }, { $push: { genres: "dystopian" }})
```

Add many to array
```bash
db.books.updateOne({ _id: ObjectId('66ddf7677e2d70dcc35e73ac') }, { $push: { genres: { $each: ["1", "2"] } }})
```

Use index
```bash
db.books.find({ rating: 8 }).explain('executionStats')

db.books.createIndex({ rating: 8 })

db.books.getIndexes()

db.books.find({ rating: 8 }).explain('executionStats')

db.books.dropIndex({ rating: 8 })
```

Close connection
```bash
exit
```

## Setup Node.js

Install npm dependencies
```bash
npm install
```

Run node in watch mode
```bash
npm start
```

## Use cURL

List all documents
```bash
curl localhost:3000/books
```

List single document
```bash
curl localhost:3000/books/66ddf7677e2d70dcc35e73ac
```

Add document
```bash
curl -X POST localhost:3000/books --header "Content-Type: application/json" -d '{ "title": "The Final Empire", "author": "Brandon Sanderson", "rating": 9, "pages": 420, "genres": ["fantasy", "magic"], "reviews": [ { "name": "Shaun", "body": "Couldn'\''t put this book down."}, { "name": "Chun-li", "body": "Love it."} ] }'
```

Update document
```bash
curl -X PATCH localhost:3000/books/66ddf7677e2d70dcc35e73ac --header "Content-Type: application/json" -d '{ "rating": 8, "pages": 350 }'
```

Delete document
```bash
curl -X DELETE localhost:3000/books/66ddf7677e2d70dcc35e73ac
```

## Clean up

Clean up the containers and the data volume
```bash
docker compose down
docker volume rm mongodb_mongodb
```
