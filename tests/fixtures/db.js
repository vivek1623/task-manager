const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
  _id: userOneId,
  name: 'vivasi',
  email: 'vivasi@gmail.com',
  password: 'Vivasi@1623',
  age: 21,
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECURITY_KEY)
    }
  ]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
  _id: userTwoId,
  name: 'vivek',
  email: 'vivek@gmail.com',
  password: 'Vivek@1623',
  age: 28,
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECURITY_KEY)
    }
  ]
}

const taskOneId = new mongoose.Types.ObjectId()

const taskOne = {
  _id: taskOneId,
  name: 'user one task one',
  completed: false,
  owner: userOne._id
}

const taskTwoId = new mongoose.Types.ObjectId()

const taskTwo = {
  _id: taskTwoId,
  name: 'user one task two',
  completed: true,
  owner: userOne._id
}

const taskThreeId = new mongoose.Types.ObjectId()

const taskThree = {
  _id: taskThreeId,
  name: 'user two task one',
  completed: true,
  owner: userTwo._id
}

const setUpDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await new User(userOne).save()
  await new User(userTwo).save()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
}

module.exports = {
  userOne,
  userOneId,
  userTwo,
  userTwoId,
  taskOne,
  taskOneId,
  taskTwo,
  taskTwoId,
  taskThree,
  taskThreeId,
  setUpDatabase
}
