const mongoose  = require("mongoose");

//const uri = "mongodb+srv://PetDayCareAdmin:IloveDogs123@petdaycareapp.d3iabgj.mongodb.net/?retryWrites=true&w=majority&appName=PetDayCareApp";
const uri ="mongodb+srv://PetDayCareAdmin:12345@petdaycareapp.d3iabgj.mongodb.net/?retryWrites=true&w=majority&appName=PetDayCareApp"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

  const LoginSchema =  new mongoose.Schema({
   name: { type: String, required: true },
   password: { type: String, required: true }
  });

  const collection = new mongoose.model("users", LoginSchema);
  module.exports = collection;