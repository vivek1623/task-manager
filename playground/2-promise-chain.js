require('../src/db/mongoose')
const Task = require('../src/models/task')

const taskId = "5eadb624624b2f0a475f2cfa"

// Task.findByIdAndRemove(taskId).then(task => {
//   console.log('task', task)
//   return Task.find({})
// }).then(tasks => {
//   console.log('all tasks ', tasks)
//   return Task.countDocuments({ completed: false })
// }).then(count => {
//   console.log('incomplete task ', count)
// }).catch(error => {
//   console.log(error)
// })

const deleteTaskAndCount = async (id) => {
  const task = await Task.findByIdAndRemove(id)
  const count = await Task.countDocuments({ completed: false })
  return count
}

deleteTaskAndCount("5eadb6ae624b2f0a475f2cfb").then(count => {
  console.log(count)
}).catch(error => {
  console.log(error)
})