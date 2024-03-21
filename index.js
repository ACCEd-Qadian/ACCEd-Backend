const express = require('express')
const cors = require("cors")
const fs = require("fs");
const bodyparser = require("body-parser");
const port = process.env.PORT || 2000;
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose");
const User = require("./models/useModel");


const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))


// Database connection 
mongoose.connect("mongodb+srv://acced:ObQn8maGlhjlCW8m@clusteracced.vxkfu0a.mongodb.net/ACCEd?retryWrites=true&w=majority"
    , {
        useNewUrlParser:true,
        useUnifiedTopology:true
    });


// GET API 
app.get("/",(req, res)=>{
    res.send(`server is ready on the port ${port}`)
})


// Read file 
let currentData = [];
try {
    currentData = require("./data")
    
} catch (error) {
    console.log("error reading data.js", error)
}


// Student Data Post API 
app.post("/studentdata",(req, res)=>{
const {
    studentName,
    fatherName,
    enrollmentNumber,
    course,
    grade,
    startdate,
    enddate,
    date
} = req.body;

if (enrollmentNumber==="") {
    return res.status(400).send("Fill in all the fields");   
}


const isenrollmentNumDuplicate = currentData.some(data=>data.enrollmentNumber===enrollmentNumber);
if (isenrollmentNumDuplicate) {
    return res.status(400).send("Enrollment Already exists");   
}


// Generate index number 
const index = currentData.length;

const newData = {
    index,
    studentName,
    fatherName,
    enrollmentNumber,
    course,
    grade,
    startdate,
    enddate,
    date
};
console.log("Recieved form data",newData)
currentData.push(newData);

fs.writeFile("data.js",`module.exports = ${JSON.stringify(currentData, null, 2)}`, (err)=>{
    if (err) {
        console.log("error writing data.js", err);
        res.status(500).send("error saving data")
    }else{
        res.send("data saved success")
    }
})
})


// Student Data Search API
app.get("/search",(req, res)=>{ 
    const {enrollmentNumber} = req.query;
const newdata = {enrollmentNumber}
    console.log("new data is"+newdata)

    // Find Data 
    const searchData = currentData.find(data=>data.enrollmentNumber === enrollmentNumber);
    if (searchData) {
        res.json(searchData)
    }else{
        res.status(404).send("Data not found")
    }
})


// Register API 
// 
let usersData = []
try {
    usersData = require("./userdata")
    
} catch (error) {
    console.log("error reading userdata.js", error)
}

app.post("/register", async(req, res)=>{
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
      });

      console.log("user1" + user)

      const createdUser = await user.save();

      res.send({
        name: createdUser.name,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin,
    });
})


// Login API 
app.post("/login", async(req, res)=>{ 
    const user = await User.findOne({ email: req.body.email });

    if(user){
        if (bcrypt.compareSync(req.body.password, user.password)) {
            res.send({
              _id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
            });
            return;
          }
    }
        res.status(401).send({ message: 'Invalid email or password' });
})



app.listen(port,()=>{
    console.log(`server is ready on the port ${port}`)
})
