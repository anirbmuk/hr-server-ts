import { Schema, model } from 'mongoose'
import validator from 'validator'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { IBase, IStatics } from '.'

const client_secret = process.env.hr_server_client_secret || ''

export interface IUser extends IBase<IUser> {
  email: string
  password: string
  role: 'HR_EMPLOYEE' | 'HR_MANAGER' | 'HR_ADMIN'
  locale: 'en-US' | 'es'
  tokens: { token: string }[]
  generateAuthToken: () => Promise<string>
}

export interface IUserStatics extends IStatics<IUser> {
  authenticate: (email: string, password: string) => Promise<IUser>
}

const userSchema = new Schema<IUser, IUserStatics>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value: string) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not in standard format')
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  locale: {
    type: String,
    default: 'en-US',
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
})

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject._id
  delete userObject.__v
  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.method('generateAuthToken', async function generateAuthToken() {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, client_secret)
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
})

userSchema.static(
  'authenticate',
  async function authenticate(email: string, password: string): Promise<IUser> {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Invalid email or password')
    }
    const match = await bcryptjs.compare(password, user.password)
    if (!match) {
      throw new Error('Invalid email or password')
    }
    return user
  },
)

userSchema.pre('save', async function save(next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8)
  }
  next()
})

export const User = model<IUser, IUserStatics>('user', userSchema)
