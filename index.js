// dns server for mongodb connection
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 8000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const run = async () => {
    try {
        await client.connect();
        const db = client.db('wanderlust-db')
        const destinationCollection = db.collection("destinations")
        const bookingCollection = db.collection('bookings')

        app.get('/destination', async (req, res) => {
            const result = await destinationCollection.find().toArray()
            res.json(result)
        })

        app.get('/destination/:id', async (req, res) => {
            const { id } = req.params

            const result = await destinationCollection.findOne({ _id: new ObjectId(id) })
            res.json(result)
        })

        app.post('/destination', async (req, res) => {
            const destinationData = req.body

            // console.log(destinationData)
            const result = await destinationCollection.insertOne(destinationData)
            res.json(result)
        })

        app.patch('/destination/:id', async (req, res) => {
            const { id } = req.params
            const updatedFormData = req.body

            const result = await destinationCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedFormData })
            res.json(result)
        })

        app.delete('/destination/:id', async (req, res) => {
            const { id } = req.params
            const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) })
            res.json(result)
        })

        app.post('/my-bookings', async (req, res) => {
            const bookingData = req.body
            // console.log(bookingData)

            const result = await bookingCollection.insertOne(bookingData)
            res.json(result)
        })

        app.get('/my-bookings/:userId', async (req, res) => {
            const { userId } = req.params
            const result = await bookingCollection.find({ userId: userId }).toArray()
            res.json(result)
        })

        app.delete('/my-booking/:bookingId', async (req, res) => {
            const { bookingId } = req.params
            const result = await bookingCollection.deleteOne({ _id: new ObjectId(bookingId) })
            res.json(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World! from Sabbir')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})