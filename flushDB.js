import pkg from 'mongodb';
const { MongoClient } = pkg;

const MONGO_URI = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const DATABASE_NAME = "ssb-db"; // Replace with your database name

async function clearDatabase() {
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(DATABASE_NAME);
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`Dropped collection: ${collection.name}`);
        }

        console.log("All collections have been deleted.");
    } catch (error) {
        console.error("Error clearing database:", error);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

// Run the script
clearDatabase();
