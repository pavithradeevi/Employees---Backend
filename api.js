const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();
router.use(bodyParser.json());

// MongoDB connection URI
const mongoURI = 'mongodb+srv://employees:employees@cluster0.rburcth.mongodb.net/';

// Create a MongoDB client and connect to the server
const client = new MongoClient(mongoURI, { useUnifiedTopology: true });
client.connect();

// Define the collection name
const collectionName = 'employees';

// Handle errors if any during database operations
const handleDBError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: 'Database operation failed' });
};

// Update a document in the collection
const updateDocument = async (id, salary) => {
  try {
    const db = client.db();
    const collection = db.collection(collectionName);
    await collection.updateOne({ _id: ObjectId(id) }, { $set: { salary } });
  } catch (error) {
    throw error;
  }
};

router.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { salary } = req.body;

  try {
    await updateDocument(id, salary);
    res.sendStatus(200);
  } catch (error) {
    handleDBError(res, error);
  }
});

module.exports = router;
