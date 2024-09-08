require('dotenv').config();
const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
    connectToDb: async (callback) => {
        try {
            const USERNAME = process.env.DB_USERNAME;
            const PASSWORD = process.env.DB_PASSWORD;
            const url = `mongodb://${USERNAME}:${PASSWORD}@localhost:27017/bookstore?authSource=admin`;
            const client = await MongoClient.connect(url);
            dbConnection = client.db();
            return callback();
        } catch (error) {
            console.log('connectToDb error', error);
            return callback(error);
        }
    },
    getDb: () => dbConnection,
}