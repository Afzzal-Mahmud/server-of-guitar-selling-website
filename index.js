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

        const database = client.db('GuitarDb')

        /* collection for all user review */
        const reviewCollection = database.collection('user_review')

        /* set each person review to the database */
        app.post('/review',async(req,res) =>{
            const userReview = req.body
            const result = await reviewCollection.insertOne(userReview)
            console.log(result,"result from backend")
            console.log(userReview)
            res.json(result)
        })

        /* get all person review data from the database */
        app.get('/allreview',async(req,res) =>{
          const cursor = reviewCollection.find({})
          const allUserReview = await cursor.toArray()
          res.send(allUserReview)
        })


        /* collection for all unique guiitar */
        const uniqueGuitarCollection = database.collection('unique_guitar_collection')

         /* get unique-guitar collection data from the database */
         app.get('/uniqueguitar',async(req,res) =>{
          const cursor = uniqueGuitarCollection.find({})
          const allUniqueGuitar = await cursor.toArray()
          res.send(allUniqueGuitar)
        })

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