const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
  res.send('islamc vision server is running')
})


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.orsq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const seriesCollection = client.db('moviePortalDB').collection('series');
    const favoriteCollection = client.db('moviePortalDB').collection('favorite');
    const userCollection = client.db('moviePortalDB').collection('users');

    // get all series
    app.get('/series', async (req, res) => {
      const cursor = seriesCollection.find().sort({ ratings: -1 });
      const result = await cursor.toArray();
      res.send(result)
    })

    // get specific id
    app.get('/series/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await seriesCollection.findOne(filter);
      res.send(result);
    })

    // create/add series to db
    app.post('/series', async (req, res) => {
      const series = req.body;
      const result = await seriesCollection.insertOne(series);
      res.send(result);
    })


    // delete a specific data/id
    app.delete('/series/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await seriesCollection.deleteOne(filter);
      res.send(result)
    })


    // get all favorites
    app.get('/favorite', async (req, res) => {
      const cursor = favoriteCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.put('/favorite/:id', async (req, res) => {
      const id = req.params.id;
      const series = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedSeries = {
        $set: {
          postar: series.postar,
          title: series.title,
          genre: series.genre,
          duration: series.duration,
          release: series.release,
          ratings: series.ratings,
          summary: series.summary
        }
      }

      const result = await favoriteCollection.updateOne(filter, updatedSeries, option)
      res.send(result);
    })

    // get specific favorite
    app.get('/favorite/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await favoriteCollection.findOne(filter);
      res.send(result)
    })

    // delete favorite
    app.delete('/favorite/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await favoriteCollection.deleteOne(filter);
      res.send(result);
    })



    // users related api
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`this server is running on port: ${port}`);
})

