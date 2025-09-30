const mongoose = require('mongoose')


const connectDB = async(req,res) =>{
    try {
        
      const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URI}`);
      console.log(`MongoDB Connected || host ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGO CONNECTION ERROR - ",error)
        
    }
}

module.exports=  connectDB;