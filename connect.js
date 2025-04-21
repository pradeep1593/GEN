import mongoose from 'mongoose';
const connectDB=(url)=>{
    mongoose.set('strictQuery',true);// this can be used when we are working with the search functionality
    mongoose.connect(url)
        .then(()=>console.log('MongoDB connected'))
        .catch((err)=>console.log('Database conenction error',err));
}
export default connectDB;