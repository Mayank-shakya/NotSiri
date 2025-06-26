import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import path from 'path'

const _dirname=path.resolve()

const app=express()
app.use(cors({
    origin:"https://notsiri.onrender.com",
    credentials:true
}))



const port=process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

app.use(express.static(path.join(_dirname,"/frontend/dist")))
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(_dirname, "frontend", "dist", "index.html"));
});


app.listen(port,()=>{
    connectDb()
    console.log("server started")
})

