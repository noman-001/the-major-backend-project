import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
// when we use middle ware, we use "app.use"
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true

}))
app.use(express.json({limit: "16kb"})) // limit to json files to avoid server crash
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser()) 

// Middleware: for example we request /instagram and the backend will supply account details
// but before that we need to check whether log in happened or not, this is middleware


// routes import 
import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import likeRouter from './routes/like.routes.js';



// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
// http://localhost:8000/api/v1/users/register


export { app }