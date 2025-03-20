require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
    const seriesCollection = client.db('moviePortalDB').collection('series');
    const favoriteCollection = client.db('moviePortalDB').collection('favorite');
    const userCollection = client.db('moviePortalDB').collection('users');

    // get all series
    app.get('/series', async (req, res) => {
      const {searchParams} = req.query;

      let option = {}
      
      if(searchParams){
        option = {title: {$regex: searchParams, $options: 'i'}}
      }
      const cursor = seriesCollection.find(option).sort({ ratings: -1 });
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


    // update seris api
    app.patch('/update-series/:id', async(req, res) => {
      const id = req.params.id;
      const currentSeries = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedSeries = {
        $set:{
          postar: currentSeries.postar,
          title: currentSeries.title,
          genre: currentSeries.genre,
          duration: currentSeries.duration,
          release: currentSeries.release,
          ratings: currentSeries.ratings,
          summary: currentSeries.summary,
        }
      }
      const result = seriesCollection.updateOne(filter, updatedSeries, options);
      res.send(result);
    })

    // get all favorites
    app.get('/favorite', async (req, res) => {
      const cursor = favoriteCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })


    app.post('/favorite', async(req, res) => {
      const favoriteSeries = req.body;
      const result = await favoriteCollection.insertOne(favoriteSeries);
      res.send(result);
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


    // create/add user
    app.post('/user', async(req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result); 
    })
  } finally {
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`this server is running on port: ${port}`);
})

