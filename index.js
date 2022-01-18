const { MongoClient } = require('mongodb');
const express = require('express')
const ObjectId = require('mongodb').ObjectId;
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
        console.log('database connected successfully')

        const database = client.db('GuitarDb')
        /* create user collection */
        const userCollection = database.collection('website_users')

        app.post('/users',async(req,res) =>{
          const user = req.body
          const result =await userCollection.insertOne(user)
          console.log(result)
          res.json(result)
        })

        app.put('/users', async(req,res) =>{
          const user = req.body;
          const filter = {email : user.email}
          const options = {upsert : true}
          const updateDoc = {$set : user}
          const result =await userCollection.updateOne(filter,updateDoc,options)
          console.log(result)
          res.json(result)
        })

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


        /* collection for all guiitar */
        const allGuitarCollection = database.collection('all_guitar_collection')

         /* get all-guitar collection data from the database */
         app.get('/allguitar',async(req,res) =>{
          const cursor = allGuitarCollection.find({})
          const allGuitar = await cursor.toArray()
          res.send(allGuitar)
        })

        /* set guitar data to the database */
        app.post('/insertguitar',async(req,res) =>{
          const guitar = req.body
          const result = await allGuitarCollection.insertOne(guitar)
          console.log(result,"result from insert a guitar on explore page")
          console.log(guitar)
          res.json(result)
      })

        /* collection of all user_cart_data */
        const allUserCartCollection = database.collection('all_user_cart_collection')

        /* set each person review to the database */
        app.post('/cart',async(req,res) =>{
            const userCart = req.body
            const result = await allUserCartCollection.insertOne(userCart)
            res.json(result)
        })

        /* get cart data based on user Email */
        app.get('/usercart/',async(req,res) =>{
          const email = req.query.email;
          const query = {email : email}
          const cursor = allUserCartCollection.find(query)
          const result = await cursor.toArray()
          res.json(result)
        })

        /* delete a single item based on id */ 
        app.delete('/usercart/:id',async(req,res) =>{
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await allUserCartCollection.deleteOne(query)
          res.json(result)
        })

    }
    finally{
        // await client.close()
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello from Guitar Selling website')
})

app.listen(port, () => {
  console.log(`listening at port ${port}`)
})