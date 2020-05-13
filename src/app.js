const express = require('express')
require('./db/mongoose') //to connect database

const app = express()

const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

//====================== EXPRESS MIDDLEWARE =========================
//Without middleware  new request -> run handler router
//With Middleware new request -> middlware func run -> run handler router

// app.use((req, res, next) => {
//   res.status(503).send('Server is under maintenance. We will come back soon')
// })

//===================================================================

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app