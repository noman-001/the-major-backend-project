//require('dotenv').config({path: './env'})
import dotenv from "dotenv" // provide env file to all
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import connectDB from "./db/index.js"


dotenv.config({
    path: './.env'
})

// In this method we make another folder/file for mongodb and call it in index.js
connectDB()
// returns a promise
.then(()=>{
    app.on("error",(error)=>{
        console.log("error: ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running ar port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed!!",err);
})






/*
In this approach we call mongodb in the index file 
import express from "express"
const app = express()
(async ()=>{   // this iife's normally functions are executed when called. iife's allow functions to execute immediately
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR ",error);
            throw error 
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch(error){
        console.log("ERROR ",error)
        throw error
    }
})()
*/