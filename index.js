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

function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            email = 'Invalid Email'
        }
        if (decoded) {
            email = decoded
        }
    })
}
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
        
        /*  http://localhost:5000/items 10000000*/
        app.get('/items', async (req, res) => {
            const query = req.query;
            if (query.email) {
                const cursor = collection.find(req.query);
                const result = await cursor.toArray();
                res.send(result)
            }
            else {
                const pages = parseInt(req.query.pages);
                const size = parseInt(req.query.sizes);
                const query={}
                const cursor = collection.find(query);
                let result;
                if(pages || size){
                    result= await cursor.skip(pages*size).limit(size).toArray()
                }else{
                    result = await cursor.toArray()
                }
                res.send(result)
               
            }
        })
        app.get('/itemsCount', async (req, res) => {
            // const query = {};
            // const cursor = collection.find(query);
            // const count = collection.count(count)
            const result = await collection.estimatedDocumentCount();
            res.send({result})
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
        /* item delete 100000*/
        app.delete('/items/:id',async(req,res)=>{
            const query = req.params.id;
            const filter = { _id: ObjectId(query) };
            console.log(filter)
            const result = await collection.deleteOne(filter);
            res.send(result)
        })

        /* Product put  */
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data.quantity
                },
            };
            const result = await collection.updateOne(filter,updateDoc,options);
            res.send(result)
        })
        // jwr
        app.post('/product', async (req, res) => {
            const product = req.body;
            const accessToken = req.body.token;
            const email = product.email;
            console.log(email);
            const decoded = verifyToken(accessToken);
            console.log(decoded.email);
            if (email === decoded.email) {

                if (!product.name || !product.price || !product.image || !product.quantity || !product.SPName || !product.details) {
                    return res.send({ success: false, error: Please })
                }
                await collection.insertOne(product);
                res.send({ success: true, message: SuccesFully  })
            }
            else {
                res.send({ success: 'UnAuthoraized Access' })
            }

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

