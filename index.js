const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors(
    {
        origin: ['https://shelf2borrow.web.app/', 'http://localhost:5000']
    }
));
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sccpwsm.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const brandCollection = client.db('BrandDB').collection('brandInfo')
        const productsCollection = client.db('BrandDB').collection('productInfo')
        const cartCollection = client.db('BrandDB').collection('cartInfo')
        const comingSoon = client.db('BrandDB').collection('Coming soon')

        //auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'none'
            })
                .send(token)
        })


        //services related

        app.post('/brands', async (req, res) => {
            const data = req.body;
            const result = await brandCollection.insertOne(data)
            res.send(result)
        })

        app.get('/brands', async (req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const data = req.body;
            const result = await productsCollection.insertOne(data)
            res.send(result)
        })

        app.get('/products/:brand_name', async (req, res) => {
            const cursor = productsCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })


        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateData = req.body;
            const options = { upsert: true }
            const data = {
                $set: {
                    photo: updateData.photo,
                    name: updateData.name,
                    brand_name: updateData.brand_name,
                    type: updateData.type,
                    price: updateData.price,
                    description: updateData.description,
                    rating: updateData.rating,

                }
            }
            const result = await productsCollection.updateOne(filter, data, options)
            res.send(result)
        })

        // Cart section
        app.post('/carts', async (req, res) => {
            const data = req.body;
            const result = await cartCollection.insertOne(data)
            res.send(result)
        })

        app.get('/carts', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })


        // coming soon
        app.get('/coming', async (req, res) => {
            const cursor = comingSoon.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Brand Shop server is running')
})

app.listen(port, () => {
    console.log(`Brand shop server is running ok:${port}`)
})