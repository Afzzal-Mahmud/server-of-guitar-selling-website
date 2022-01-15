const { MongoClient } = require('mongodb');
const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

/* middlewere */
const cors = require('cors')
app.use(cors())
app.use(express.json())

/* database data */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qzjm0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect()
        console.log('database connet successfully')
    }
    finally{
        // await client.close()
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})


client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})