require('../src/db/mongoose')
const User = require('../src/models/user')

const userId = "5eadac8c6b5ad3082cc3b7d3"

// User.findByIdAndUpdate(userId, { age: 30 }).then(user => {
//   console.log(user)
//   return User.countDocuments({ age: 20 })
// }).then(result => {
//   console.log(result)
// }).catch(error => {
//   console.log(error)
// })

const updateAgeAndCount = async (id, age) => {
  const user = await User.findByIdAndUpdate(id, { age })
  const count = await User.countDocuments({ age })
  return count
}

updateAgeAndCount(userId, 30).then(count => {
  console.log('count: ', count)
}).catch(error => {
  console.log('error', error)
})
