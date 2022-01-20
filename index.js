const { MongoClient } = require('mongodb');
const express = require('express')
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

/* middlewere */
const cors = require('cors')
app.use(cors())
app.use(express.json())

/* connect to firebase */
const serviceAccount = JSON.parse(process.env.FIREBASE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



/* varify token */
async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];

      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      }
  }
  next();
}


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
          res.json(result)
        })

        /* make a user admin */
        app.put('/users/admin',verifyToken, async(req,res) => {
          const user = req.body;
          const requester = req.decodedEmail

          if(requester){
            const requesterAccount =await userCollection.findOne({email : require})
              if(requesterAccount.role ==='admin'){
                const filter = {email : user.email}
                const updateDoc = {$set : {role: 'admin'}}
                const result = await userCollection.updateOne(filter,updateDoc)
                res.json(result)
              }
          }
          else{
              res.status(403).json({message : 'You do not have access to make admin'})
          }
        })

        /* checking is a user is admin or not . Do not use to much like get,post,put on same route .try defrent one */
        app.get('/useradmin/:email', async(req,res) =>{
          const email = req.params.email;
          const query = {email : email}
          const user = await userCollection.findOne(query)
          if(user?.role === 'admin'){
            res.json({admin : true})
          }else{
            res.json({admin : false})
          }
        })

        /* collection for all user review */
        const reviewCollection = database.collection('user_review')

        /* set each person review to the database */
        app.post('/review',async(req,res) =>{
            const userReview = req.body
            const result = await reviewCollection.insertOne(userReview)
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
          // console.log(guitar)
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
        app.get('/usercart',async(req,res) =>{
          const email = req.query.email;
          const query = {email : email}
          const cursor = allUserCartCollection.find(query)
          const result = await cursor.toArray()
          res.json(result)
        })

        /* update all user cart collection when click procced */
        app.put('/usercart/update',async(req,res) =>{
          const user = req?.body
          const filter = {email : user.userEmail}
          const updateDoc = {$set : {status: 'pending'}}
          const result = await allUserCartCollection.updateMany(filter,updateDoc)
          res.json(result)
        })

        /* load allUser data on admin pannel */
        app.get('/allusercartdata', async(req,res) =>{
          const cursor = allUserCartCollection.find({})
          const allUserData = await cursor.toArray()
          res.send(allUserData)
        })

        // /* update user cart status */
        // app.put('/usercart/updatestatus',async(req,res) =>{
        //   const user = req?.body
        //   const filter = {email : user.userEmail}
        //   const options = {upsert : true}
        //   const updateDoc = {$set : {status: 'successfull'}}
        //   const result = await allUserCartCollection.updateMany(filter,updateDoc,options)
        //   res.json(result)
        // })

        /* delete a single item based on id */ 
        app.delete('/usercart/:id',async(req,res) =>{
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await allUserCartCollection.deleteOne(query)
          res.json(result)
        })

        /* delete a single item based on id */ 
        app.delete('/deleteproduct/:id',async(req,res) =>{
          const id = req.params.id;
          const query = {_id : ObjectId(id)}
          const result = await allGuitarCollection.deleteOne(query)
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