const express = require('express')
const Task = require('../models/task')
const authMiddleware = require('../middlewares/auth')

const router = new express.Router()

// create a task

router.post('/tasks', authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id })
  //------------using async await-------------
  try {
    const t = await task.save()
    res.status(201).send(t)
  } catch (e) {
    res.status(400).send(e)
  }

  //------------using promise-------------
  // task.save().then(t => {
  //   res.status(201).send(t)
  // }).catch(e => {
  //   res.status(400).send(e)
  // })
})

//Get task with query string '/tasks?completed=true'
//'/tasks?skip=0&limit=10'
//'/tasks?sortBy=createdAt:desc'
//'/tasks?sortBy=name:asc'

router.get('/tasks', authMiddleware, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.completed)
    match.completed = req.query.completed === 'true'
  if(req.query.sortBy){
    const params = req.query.sortBy.split(':')
    sort[params[0]] = params[1] === 'desc' ? -1 : 1
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options:{
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

//get all tasks
/*
router.get('/tasks', authMiddleware, async (req, res) => {
  //------------using async await-------------
  try {
    // can be solve using two approaches
    //way 1
    const tasks = await Task.find({ owner: req.user._id })
    res.send(tasks)

    //way2 L-115

    // await req.user.populate('tasks').execPopulate()
    // res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }

  //------------using promise-------------
  // Task.find({}).then(tasks => {
  //   res.send(tasks)
  // }).catch(e => {
  //   res.status(500).send(e)
  // })
})
*/

//get single task

router.get('/tasks/:id', authMiddleware, async (req, res) => {
  //------------using async await-------------
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task)
      return res.status(404).send('task not found')
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }

  //------------using promise-------------
  // Task.findById(req.params.id).then(task => {
  //   if (!task)
  //     return res.status(404).send('Task not found')
  //   res.send(task)
  // }).catch(e => {
  //   res.status(500).send(e)
  // })
})

//update task

router.patch("/tasks/:id", authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'completed']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))
  if (!isValidOperation)
    res.status(400).send({ error: "invalid updates" })
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task)
      return res.status(404).send('task not found')
    updates.forEach(update => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

//delete task

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params._id, owner: req.user._id })
    if (!task)
      return res.status(404).send('task not found')
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
