import { MongoClient } from 'mongodb';

// URI local para ir probando
const uri = "mongodb://localhost:27017/";
const dbName = "pizzeria";

const client = new MongoClient(uri);

export { client, dbName };