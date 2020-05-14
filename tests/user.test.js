const request = require('supertest')

const app = require('../src/app')
const { userOne, userOneId, setUpDatabase } = require('./fixtures/db')
const User = require('../src/models/user')

beforeEach(setUpDatabase)

test('should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'shweta bharti',
    email: 'shwetabharti@gmail.com',
    password: 'Shweta@1623',
    age: 21
  }).expect(201)

  //Assertion that the databse has changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  //Assertion about response
  // expect(response.body.user.name).toBe('shweta bharti')
  expect(response.body).toMatchObject({
    user: {
      name: 'shweta bharti',
      email: 'shwetabharti@gmail.com',
      age: 21
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('Shweta@1623')
})

test('should login a user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login non existing user', async () => {
  await request(app).post('/users/login').send({
    email: 'wrongemail@gmail.com',
    password: 'something'
  }).expect(404)
})

test('should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer thisisawrongtoken`)
    .send()
    .expect(401)
})

test('should update valid user field', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'hasi',
      age: 22
    }).expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toBe('hasi')
  expect(user.age).toBe(22)
})

test('should not update invalid user', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'patna',
      age: 22
    }).expect(400)
})

test('should delete user profile', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('should not delete profile for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('should upload profile avatar', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/8.png')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should logout user', async () => {
  await request(app)
    .post('/users/logout')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not logout for unauthenticated user', async () => {
  await request(app)
    .post('/users/logout')
    .send()
    .expect(401)
})

test('should logout from all devices', async () => {
  await request(app)
    .post('/users/logoutAll')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not logout All for unauthenticated user', async () => {
  await request(app)
    .post('/users/logoutAll')
    .send()
    .expect(401)
})

