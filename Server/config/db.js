import mongoose from "mongoose";


const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Conexión a mongo exitosa ${conn.connection.host}`)
    } catch(err){
        console.error(`Error de conexión: ${err}`)
        process.exit(1)
    }
};

export default connectDB;