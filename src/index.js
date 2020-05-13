const app = require('./app')

app.listen(process.env.PORT, () => {
  console.log('Server is up on process.env.PORT ' + process.env.PORT)
})
