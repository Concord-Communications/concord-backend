const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express')
const app = express()
const messagesRoutes = require("./routes/messages")
const infoRoutes = require("./routes/info")


console.log(`environment: ${process.env.NODE_ENV}`);

app.use(express.json())
app.use(helmet())
if (process.env.NODE_ENV === 'development') {
    app.use(morgan(':method :status ":url" :remote-addr [:user-agent]'))
}

// import route files
app.use('/api/messages', messagesRoutes)
app.use('/api/info', infoRoutes)

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server started on port ${port}...`)
})





