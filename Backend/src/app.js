import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
  origin:["http://localhost:5173",
  "https://youtube-1-awig.onrender.com"],
  credentials:true
}
))

app.use(express.json({limit:"10mb"}))  //used for getting the json file

app.use(express.urlencoded({extended:true,limit:"10mb"}))
app.use("/public", express.static("public")); //used for storing the image,pdf,etc

app.use(cookieParser())  //user ke browser ka cookies access and set kar pau and then crud operation perform kar saku

//routes import

app.get("/", (req, res) => {
  res.json({ message: "Users route working!" });
});


import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js"
import videoRouter from "./routes/video.routes.js"
import watchRouter from "./routes/watch.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"

console.log("User router loaded");
app.use("/api/v1/watch",watchRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/subscription",subscriptionRouter)


export { app }
