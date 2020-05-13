const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const authMiddleware = require('../middlewares/auth')
const { sendWelcomeMail, sendCancelationMail } = require('../emails/account')

router = new express.Router()

//signup a user

router.post('/users', async (req, res) => {
  const user = new User(req.body)
  //------------using async await-------------
  try {
    // await user.save()
    sendWelcomeMail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
  //------------using promise-------------
  // user.save().then(u => {
  //   res.status(201).send(u)
  // }).catch(e => {
  //   res.status(400).send(e)
  // })
})

//login user

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    // res.send({ user: user.getPublicUser(), token }) // toJSON method autatically replace user object
    res.send({ user, token })
  } catch (e) {
    res.status(404).send(e)
  }
})

//logout user

router.post('/users/logout', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(item => item.token !== req.token)
    await req.user.save()
    res.send('Logout Successfully')
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send('you logouted from all devices')
  } catch (e) {
    res.status(500).send(e)
  }
})

//get own profile

router.get('/users/me', authMiddleware, async (req, res) => {
  // const user = req.user.getPublicUser() // no need bz we have assign toJSON method 
  res.send(req.user)
})

//update own profile

router.patch('/users/me', authMiddleware, async (req, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation)
      return res.status(400).send({ error: 'Invalid updates' })
    updates.forEach(update => req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

//delete own profile

router.delete('/users/me', authMiddleware, async (req, res) => {
  sendCancelationMail(req.user.email, req.user.name)
  req.user.remove()
  res.send(req.user)
})

//upload a profile pic

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
      return callback(new Error('please upload a image'))
    callback(undefined, true)
  }
})

router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send({ res: 'image successfully uploaded' })
}, (err, req, res, next) => {
  res.status(404).send({ error: err.message })
})

//delete avatar

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send({ res: 'Image successfully deleted' })
})

// get user profile

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar)
      throw new Error('avatar not found')
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send({ error: e })
  }
})











//get all users

router.get('/users', async (req, res) => {
  //------------using async await-------------
  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.status(500).send(e)
  }

  //------------using promise-------------
  // User.find({}).then(users => {
  //   res.send(users)
  // }).catch(e => {
  //   res.status(500).send(e)
  // })
})

//get single user by id

router.get('/users/:id', async (req, res) => {
  console.log(req.params)
  //------------using async await-------------
  try {
    const user = await User.findById(req.params.id)
    if (!user)
      return res.status(400).send('user not found')
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }

  //------------using promise-------------
  // User.findById(req.params.id).then(user => {
  //   if (!user)
  //     return res.status(404).send('user not found')
  //   res.send(user)
  // }).catch(e => {
  //   res.status(500).send(e)
  // })
})

//update a user

router.patch('/users/:id', async (req, res) => {
  //-----moongose automatically handle this case but you want to show error for this then go for it
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))
  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid updates' })
  //------------------------------------------------------------------------------------------------
  try {
    const user = await User.findById(req.params.id)
    updates.forEach(update => user[update] = req.body[update])
    await user.save() // here before save middleware called

    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) // this update will not passes by middleware before save

    if (!user)
      return res.status(404).send('user not found')
    res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

//delete a user

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user)
      return res.status(404).send('user not found')
    sendCancelationMail(user.email, user.name)
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
