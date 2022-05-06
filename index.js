const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
/*  ================ middleware ============== */
app.use(cors())
app.use(express.json());
/* ============== Mongo db  ================ */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f4zlw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log("add  mongod db")
//   // perform actions on the collection object
//   client.close();
// });

async function run() {
    try {
        await client.connect();
        const collection = client.db("Inventory").collection("product");
        /* Home pages 6 product get Link:http://localhost:5000/products 10000 */
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = collection.find(query);
            const result = await cursor.limit(6).toArray();
            res.send(result)
        })
        /*  http://localhost:5000/MyItems */
        app.get('/items', async (req, res) => {
            const query = req.query;
            if (query) {
                const cursor = collection.find(req.query);
                const result = await cursor.toArray();
                res.send(result)
            }
            else{
                const query = {};
                const cursor = collection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }


        })


        /* single product load link: http://localhost:5000/products/6274004280571e94e2338b8f 1000*/
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await collection.findOne(filter);
            res.send(result)
        })
        /* Product Post LInk: http://localhost:5000/products  100000 */
        app.post('/products', async (req, res) => {
            const query = req.body;
            const result = await collection.insertOne(query);
            res.send(result)
        })
        /* Product put  */
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data
                },
            };
            const result = await collection.updateOne(filter, options, updateDoc);
            res.send(result)
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {

    res.send("hi")
})







app.listen(port, () => {
    console.log('My website text', port)
})