const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

const PORT = process.env.APP_PORT || 3000;
const COLLECTION = 'books';
const BOOKS_PER_PAGE = 3;

// init app & middleware
const app = express();
app.use(express.json());

// db connection
let db;

connectToDb((error) => {
    if (!error) {
        app.listen(PORT, () => {
            console.log(`app listening on port ${PORT}`);
        });
        db = getDb();
    }
});

// routes
app.get('/books', async (req, res) => {
    try {
        const page = req.query.page || 0;

        const books = [];
    
        await db.collection(COLLECTION)
            .find()
            .sort({ author: 1 })
            .skip(page * BOOKS_PER_PAGE)
            .limit(BOOKS_PER_PAGE)
            .forEach(book => books.push(book));
        res.status(200)
            .json(books);
    } catch (error) {
        console.log('get /books error', error);
        res.status(500)
            .json({ error: 'Could not fetch the documents' });
    }
});

app.get('/books/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        if (ObjectId.isValid(docId)) {
            const doc = await db.collection(COLLECTION)
                .findOne({ _id: new ObjectId(docId) });
            res.status(200)
                .json(doc);
        } else {
            res.status(400)
            .json({ error: 'Not a valid document id' });
        }
    } catch (error) {
        console.log('get /books/:id error', error);
        res.status(500)
            .json({ error: 'Could not fetch the document' });
    }
});

app.post('/books', async (req, res) => {
    try {
        const book = req.body;

        const result = await db.collection(COLLECTION)
            .insertOne(book);
        res.status(201)
            .json(result);
    } catch (error) {
        console.log('post /books error', error);
        res.status(500)
            .json({ error: 'Could not create a new document' });
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        if (ObjectId.isValid(docId)) {
            const result = await db.collection(COLLECTION)
                .deleteOne({ _id: new ObjectId(docId) });
            res.status(200)
                .json(result);
        } else {
            res.status(400)
            .json({ error: 'Not a valid document id' });
        }
    } catch (error) {
        console.log('get /books/:id error', error);
        res.status(500)
            .json({ error: 'Could not delete the document' });
    }
});

app.patch('/books/:id', async (req, res) => {
    try {
        const updates = req.body;
        const docId = req.params.id;
        if (ObjectId.isValid(docId)) {
            const result = await db.collection(COLLECTION)
                .updateOne({ _id: new ObjectId(docId) }, { $set: updates });
            res.status(200)
                .json(result);
        } else {
            res.status(400)
            .json({ error: 'Not a valid document id' });
        }
    } catch (error) {
        console.log('get /books/:id error', error);
        res.status(500)
            .json({ error: 'Could not update the document' });
    }
});