const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const day_care_app = express();

day_care_app.use(express.json());

day_care_app.use(express.urlencoded({extended:false}));

day_care_app.set('view engine', 'ejs');

day_care_app.use(express.static("public"));

day_care_app.get("/", (req, res) =>{
    res.render("login");
})

day_care_app.get("/signup", (req, res) =>{
    res.render("signup");
})

day_care_app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    const existingUser = await collection.findOne({name: data.name});

    if(existingUser){
        return res.status(400).send("User already exists.");
    }else{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

   
});

day_care_app.post("/login", async (req, res) =>{
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check){
            res.send("username Can not be found");
        }
        
        const match = await bcrypt.compare(req.body.password, check.password);      
        if (!match) {
            return res.status(400).send("Invalid password.");
        }else{
            res.render("home");
        }
     
    }catch{
        res.send("wrong Details");
    }
})


const port = 5000;
day_care_app.listen(port, () => 
    console.log(`Server is running on http://localhost:${port}`)
);