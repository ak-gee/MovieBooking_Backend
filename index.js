const express = require("express");
const app= express();
const dotenv = require('dotenv');


const cors = require("cors");
const {createJwt, authenticate, permit}= require("./auth");
const bcryptjs = require("bcryptjs");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
// const dbUrl = "mongodb://localhost:27017";


//movie
app.use(express.json());
dotenv.config();
const dbUrl = process.env.DBURL ;

app.use(cors({
    // origin:"http://127.0.0.1:5500"
    // origin:"https://pizza-anp-delivery.netlify.app"
    origin:"http://localhost:3000"
}))

let students = [];
let mentors = [];

app.post("/userlogin",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        console.log(req.body.email);
        let user = await db.collection("users").findOne({"email":req.body.email});
        var response={};
      
        client.close();
        console.log(user);
        if(user){
            let result = await bcryptjs.compare(req.body.password,user.password)
            console.log(result);
            if (result){
                const token = await createJwt({id:user._id})
                console.log(token);
                
            res.json({
                // message:"Password Vefiried:Success",
                message:true,
                token
            });
            response = res.json;
        }else{
         
            // res.json({message:"Password Authentication Failed"})
            res.json({message:false})
            response = res.json;
        }
      
    }else{
        // res.json({message:"User Doesnt Exist"})
        res.json({message:false})
    }
    console.log("Response:"+ response.message,response.token)
}
    catch(error){
        console.log(error);
        result.json({
            // message:"Error USer logging in"
            message:false
        })

    }
})

app.post("/adminlogin",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        console.log(req.body.email);
        let user = await db.collection("admins").findOne({"email":req.body.email});
        var response={};
      
        client.close();
        console.log(user);
        if(user){
            let result = await bcryptjs.compare(req.body.adminpwd,user.adminpwd)
            console.log(result);
            if (result){
                const token = await createJwt({id:user._id})
                console.log(token);
                
            res.json({
                // message:"Password Vefiried:Success",
                message:true,
                token
            });
            response = res.json;
        }else{
         
            // res.json({message:"Password Authentication Failed"})
            res.json({message:false})
            response = res.json;
        }
      
    }else{
        // res.json({message:"User Doesnt Exist"})
        res.json({message:false})
    }
    console.log("Response:"+ response.message,response.token)
}
    catch(error){
        console.log(error);
        res.json({
            message:"Error USer logging in"
            // message:false
        })

    }
})

app.post("/adminregister",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let salt = await bcryptjs.genSalt(10);
        let hash = await bcryptjs.hash(req.body.adminpwd,salt);
        req.body.adminpwd =  hash;
        console.log(salt,hash)
        // alert("reg")
        // let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("admins").insertOne(req.body);
        // alert(req.body)
        client.close();
        res.json({
            // message:"Admin registered in the collection"
            message:true
        });
        console.log("Admin reg");
    }
    catch(error){
        console.log(error);
        res.json({
            // message:"Error registering Admin"
            message:false
        })

    }
})

app.post("/userregister",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let salt = await bcryptjs.genSalt(10);
        let hash = await bcryptjs.hash(req.body.password,salt);
        req.body.password =  hash;
        console.log(salt,hash)
        // alert("reg")
        // let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("users").insertOne(req.body);
        // alert(req.body)
        client.close();
        res.json({
            message:"User registered in the collection"
        });
        console.log("user reg");
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error registering student"
        })

    }
})

app.get("/allmovies",[authenticate],async(req,res) => {
    // res.json(students)
    try{
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Movie");
    let items = await db.collection("movies").find().toArray();
    client.close();
    res.json(items);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting all items"
        })

    }
})

app.get("/viewgenres",[authenticate],async(req,res) => {
    // res.json(students)
    try{
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Movie");
    let items = await db.collection("movies").find({"itemCode":"1"}).toArray();
    client.close();
    console.log(items);
    res.json(items);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting pizzas"
        })

    }
})

app.get("/pizzabase",async(req,res) => {
    // res.json(students)
    try{
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Movie");
    let items = await db.collection("movies").find().toArray();
    client.close();
    console.log(items);
    res.json(items);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting pizzabase"
        })

    }
})

app.delete("/deletemovie",[authenticate],async (req,res) => {
    try{
        console.log("Delete")
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        console.log(req.body.itemName);
        let read = await db.collection("movies").deleteOne({itemName:req.body.itemName});
        var response={};
        console.log(read);
      
        client.close();
        res.json({
            message:"Success"   
        })
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error deleting 1 item"
        })

    }
})

app.post("/addnewmovie",async (req,res) => {
    try{
        console.log("Here")
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        console.log(req.body.email);
        let user = await db.collection("movies").insertOne(req.body);
        var response={};
      
        client.close();
        res.json({
            message:"Success"
        })
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error posting 1 item"
        })

    }
})

app.put("/movie/:id",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("movies").updateOne({_id: id},{$set:{class:req.body.class}});
        client.close();
        res.json(student);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting Movie"
        })

    }
})

app.delete("/movie/:id",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("movies").deleteOne({_id: id});
        client.close();
        res.json(student);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting Movie"
        })

    }
})

app.get("/movie/:id",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("movies").findOne({_id: id});
        client.close();
        res.json(student);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting student"
        })

    }
})

app.get("/movies",[authenticate,permit(1,2,3)],async(req,res) => {
    // res.json(students)
    try{
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Movie");
    let students = await db.collection("movies").find().toArray();
    client.close();
    res.json(students);
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error getting all Movies"
        })

    }
})

app.post("/movie",async (req,res) => {
    try{
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("Movie");
      
        await db.collection("movies").insertOne({name:req.body.name});
        client.close();
        res.json({
            messae:"Success"
        })
    }
    catch(error){
        console.log(error);
        res.json({
            message:"Error posting 1 movie"
        })

    }
})

let port = 5000;
app.listen(process.env.PORT|| port,() =>{
console.log("Listening on port: "+ port)
});