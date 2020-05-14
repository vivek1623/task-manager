const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const app = require('../src/app')
const {
  userOne,
  userOneId,
  userTwo,
  taskOneId,
  setUpDatabase
} = require('./fixtures/db')
const Task = require('../src/models/task')

beforeEach(setUpDatabase)

test('should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'read ancient history'
    }).expect(201)
  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.name).toBe('read ancient history')
  expect(task.completed).toEqual(false)
})

test('should get all tasks for userOne', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  expect(response.body.length).toBe(2)
})

//Test delete task security
//Attempted to have the second user delete the first task (should fails)

test('Should not delete other user task', async () => {
  await request(app)
    .delete(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
  const task = await Task.findById(taskOneId)
  expect(task).not.toBeNull()
})

