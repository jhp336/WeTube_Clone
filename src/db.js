import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, { 
    useNewUrlParser:true
} );

const db = mongoose.connection;

db.on("error", function(error){
    console.log("Database Error", error);
});
db.once("open", function(){
    console.log("Connected to DB");
});