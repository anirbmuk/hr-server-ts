import { Router, RequestHandler } from 'express'
import guard from './../handlers/guard.mw'
import { User, IUser } from './../models/user.model'

const router = Router()

const addUser: RequestHandler = async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    res.status(201).send({ items: [user] })
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message })
  }
}

const login: RequestHandler = async (req, res) => {
  try {
    const user = await User.authenticate(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.status(200).send({ user, token, auth: true })
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message })
  }
}

const logout: RequestHandler = async (req, res) => {
  const { user, token } = req.body as { user: IUser; token: string }
  try {
    user.tokens = user.tokens.filter(eachToken => eachToken.token !== token)
    await user.save()
    res.status(200).send({ auth: false })
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message })
  }
}

const logoutall: RequestHandler = async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(200).send({ auth: false })
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message })
  }
}

router.post('', addUser)
router.post('/login', login)
router.post('/logout', guard, logout)
router.post('/logoutall', guard, logoutall)

export default router
