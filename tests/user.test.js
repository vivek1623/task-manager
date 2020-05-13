const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const userOne = {
  name: 'vivasi',
  email: 'vivasi@gmail.com',
  password: 'Vivasi@1623',
  age: 21
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

test('should signup a new user', async () => {
  await request(app).post('/users').send({
    name: 'shweta bharti',
    email: 'shwetabharti@gmail.com',
    password: 'Shweta@1623',
    age: 21
  }).expect(201)
})

test('should login a user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)
})

test('should not login non existing user', async () => {
  await request(app).post('/users/login').send({
    email: 'wrongemail@gmail.com',
    password: 'something'
  }).expect(404)
})
