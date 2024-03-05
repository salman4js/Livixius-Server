const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
// Custom Middlewares!
const {CustomMiddleWares} = require('./middlewares/custom.middleware');
// Defining routes!
const serverRoutes = require("./routes/Routes");

//mongodb+srv://salman:<password>@cluster0.vsziv.mongodb.net/?retryWrites=true&w=majority

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Using custom middleware!~
app.use('/:id', CustomMiddleWares.addParamsInBody);


const database = "mongodb+srv://salman-1:salman@cluster0.vsziv.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(database,{
    useNewUrlParser : true,
})

mongoose.connection.on("connected", () => {
    console.log("Database Connected");
    
})

mongoose.connection.on("error",(err) => {
    console.log("Some stupid error", err);
})

app.use("/", serverRoutes);

// Error handling express middlewares!
app.use((err, req, res, next) => {
    res.status(500).send('Internal Server Error!');
});

app.listen(3002,() => {
    console.log("Server is running at port 3002");
});


//module.exports.handler = serverless(app);