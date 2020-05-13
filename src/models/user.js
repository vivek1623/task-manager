const { model, Schema } = require('mongoose')
const isEmail = require('validator/lib/isEmail')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(email) {
      if (!isEmail(email))
        throw new Error({ error: 'not a valid email' })
    }
  },
  age: {
    type: Number,
    default: 0,
    min: [0, "age can not be a negative number"]
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'password must have atleast 6 characters'],
    validate(password) {
      if (password.toLowerCase().includes('password'))
        throw new Error('Password can not contains "password"')
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true //to add createdAt and UpdatedAt in schema
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', //user._id
  foreignField: 'owner' //task.owner
})

// instance Method
// assigning a method to user instance (document)

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECURITY_KEY)
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
}

// userSchema.methods.getPublicUser = function () {
//   const user = this
//   const userObject = user.toObject()
//   delete userObject.password
//   delete userObject.tokens
//   return userObject
// }


// Model method 
//assigning a method in Model

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user)
    throw new Error({ error: 'unable to login' })
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch)
    throw new Error({ error: 'unable to login' })
  return user
}

//====================== SCHEMA MIDDLEWARE =========================
//To do something before save
//Adding MIDDLEWARE
//hash the plain text password before save

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

//Delete user tasks when user removed

userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

//==================================================================

const User = model('User', userSchema)

module.exports = User