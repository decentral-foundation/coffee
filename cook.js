var mongo = require("mongodb");
let { MongoClient } = mongo;

const connectionString = process.env.ATLAS_URI || "mongodb://localhost:27017/test";

const client = new MongoClient(connectionString);

async function connectToDatabase() {
  try {
    let conn;
    try {
      conn = await client.connect();
      let db = conn.db("test");
      console.log("db: ",db);

      collection = await db.collection("coffee");
      console.log("collection: ",collection);
      const allDocs = await collection.find().toArray();
      console.log("allDocsL :",allDocs);
      process.exit(0);
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  } catch (e) {

  }
}

connectToDatabase()


// let collection;
// try {
//    
//    
// } catch(e) {
//   console.error(e);
// }