const express = require("express");
const app= express();
const dotenv = require('dotenv');


const cors = require("cors");
const {createJwt, authenticate, permit}= require("./auth");
const bcryptjs = require("bcryptjs");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
 


//movie
app.use(express.json());
dotenv.config();
const dbUrl = process.env.DBURL ;

app.use(cors({
  
     origin:"https://quizzical-clarke-2b1ad7.netlify.app"
   
}))

let students = [];
let mentors = [];

app.post("/userlogin",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
    
        let user = await db.collection("users").findOne({"email":req.body.email});
        var response={};
      
        client.close();
      
        if(user){
            let result = await bcryptjs.compare(req.body.password,user.password)
          
            if (result){
                const token = await createJwt({id:user._id})
               
                
            res.json({
                 
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
    
        res.json({message:false})
    }
  
}
    catch(error){
     
        res.json({
            // message:"Error USer logging in"
            message:false
        })

    }
})

app.post("/adminlogin",async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
   
        let user = await db.collection("admins").findOne({"adminemail":req.body.adminemail});
        var response={};
      
        client.close();
        
        if(user){
            let result = await bcryptjs.compare(req.body.adminpwd,user.adminpwd)
          
            if (result){
                const token = await createJwt({id:user._id})
              
                
            res.json({
                // message:"Password Vefiried:Success",
                message:true,
                token
            });
            response = res.json;
        }else{
         
          
            res.json({message:false})
            response = res.json;
        }
      
    }else{
 
        res.json({message:false})
    }
   
}
    catch(error){
        
        res.json({
            message:"Error USer logging in"
             
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
   
        let student = await db.collection("admins").insertOne(req.body);
       
        client.close();
        res.json({
             
            message:true
        });
     
    }
    catch(error){
        
        res.json({
         
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
      
        let student = await db.collection("users").insertOne(req.body);
       
        client.close();
        res.json({
            message:"User registered in the collection"
        });
       
    }
    catch(error){
        
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
      
        res.json({
            message:"Error getting all items"
        })

    }
})

app.get("/viewgenres",[authenticate],async(req,res) => {
    
    try{
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Movie");
    let items = await db.collection("movies").find({"itemCode":"1"}).toArray();
    client.close();
     
    res.json(items);
    }
    catch(error){
        
        res.json({
            message:"Error getting pizzas"
        })

    }
})



app.delete("/deletemovie",[authenticate],async (req,res) => {
    try{
        
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        
        let read = await db.collection("movies").deleteOne({itemName:req.body.itemName});
        var response={};
      
      
        client.close();
        res.json({
            message:"Success"   
        })
    }
    catch(error){
        
        res.json({
            message:"Error deleting 1 item"
        })

    }
})


app.post("/addnewmovie",[authenticate],async (req,res) => {
    try{
        
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
      
        let mov = await db.collection("movies").insertOne(req.body);

        var response={};
      
        
        res.json({
            message:"Success"
        })
       
       
        let ins = await db.collection("tickets").insertOne({"movieName":req.body.movieName,"movieTime":"11am","movieDate":'',"ticketLeft":req.body.ticketquantity});
        ins = await db.collection("tickets").insertOne({"movieName":req.body.movieName,"movieTime":"2pm","movieDate":'',"ticketLeft":req.body.ticketquantity});
        ins = await db.collection("tickets").insertOne({"movieName":req.body.movieName,"movieTime":"7pm","movieDate":'',"ticketLeft":req.body.ticketquantity});
        ins = await db.collection("tickets").insertOne({"movieName":req.body.movieName,"movieTime":"11pm","movieDate":'',"ticketLeft":req.body.ticketquantity});
        
        client.close();
   
    }
    catch(error){
       
        res.json({
            message:"Error posting 1 item"
        })

    }
})

app.post("/tickets",[authenticate],async (req,res) => {
    try{
   
        var upd_val,upd_tkt;
        var client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let ticketsLeft = await db.collection("tickets").findOne({"movieName":req.body.movieName,
        "movieTime":req.body.movieTime,"movieDate":req.body.movieDate});
       if (ticketsLeft != null)
        
        {
            upd_val = ticketsLeft.ticketLeft-req.body.numberoftickets;
            upd_tkt = ticketsLeft.ticketBooked + req.body.numberoftickets;
 

        }
       else
        {
            upd_val = 100-req.body.numberoftickets;
            upd_tkt = req.body.numberoftickets
        }
      

        let upd = await db.collection("tickets").updateOne({"movieName":req.body.movieName,
        "movieTime":req.body.movieTime,"movieDate":req.body.movieDate},//"ticketBooked":req.body.numberoftickets
        {
            $set:
            {
                "ticketBooked":upd_tkt,
                "ticketLeft":upd_val
            }
        },
        { upsert: true }
            );
    

      
        // let mov = await db.collection("tickets").updateOne({movieName:req.body.movieName,movieDate:req.body.movieDate,movieTime:req.body.movieTime},{$set:{ticketquantity:{ticketsLeft}});

        
        res.json({
            message:"Success"
        })
            
       
        
   
    }
    catch(error){
         
        res.json({
            message:"Error posting 1 item"
        })

    }
    finally{

        client.close();
    }
})


app.put("/movie/:id",[authenticate],async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("movies").updateOne({_id: id},{$set:{class:req.body.class}});
        client.close();
        res.json(student);
    }
    catch(error){
       
        res.json({
            message:"Error getting Movie"
        })

    }
})

app.delete("/movie/:id",[authenticate],async (req,res) => {
    try{
        let client =  await mongoClient.connect(dbUrl)
        let db = client.db("Movie");
        let id = mongodb.ObjectID(req.params.id);
        let student = await db.collection("movies").deleteOne({_id: id});
        client.close();
        res.json(student);
    }
    catch(error){
    
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
      
        res.json({
            message:"Error getting student"
        })

    }
})

app.get("/movies",[authenticate,permit(1,2,3)],async(req,res) => {
 
    try{
    let client = await mongoClient.connect(dbUrl);
    let db = client.db("Movie");
    let students = await db.collection("movies").find().toArray();
    client.close();
    res.json(students);
    }
    catch(error){
      
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
      
        res.json({
            message:"Error posting 1 movie"
        })

    }
})

let port = 5000;
app.listen(process.env.PORT|| port,() =>{
//console.log("Listening on port: "+ port)
});
