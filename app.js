import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express'
import { router as messagesRoutes } from "./routes/messages.js"
import { router as infoRoutes } from "./routes/info.js"
import { router as authroutes } from "./routes/auth.js"
import cors from "cors"

const app = express()

console.log(`environment: ${process.env.NODE_ENV}`);

app.use(cors({
    origin: "http://localhost:5173",
}))
app.use(express.json())
app.use(helmet())
app.use(morgan(':method :status ":url" :remote-addr [:user-agent]'))

// import route files
app.use('/api/messages', messagesRoutes)
app.use('/api/info', infoRoutes)
app.use('/api/auth', authroutes)

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server started on port ${port}...`)
})





