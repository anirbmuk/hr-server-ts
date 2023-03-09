import { Router, RequestHandler } from 'express';
import guard from './../handlers/guard.mw';
import { User, IUser } from './../models/user.model';

const router = Router();

const addUser: RequestHandler = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send({ items: [user] });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const deleteUser: RequestHandler<{ email: string }> = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send();
    }
    await user.deleteOne();
    res.status(200).send(user);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('400');
    }
    const user = await User.authenticate(email, password);
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token, auth: true });
  } catch (error: unknown) {
    const { message } = error as Error;
    if (message === '400') {
      res.status(400).send({ error: 'Invalid email or password' });
    } else {
      res.status(500).send({ error: message });
    }
  }
};

const logout: RequestHandler = async (req, res) => {
  const { user, token } = req as { user: IUser; token: string };
  try {
    user.tokens = user.tokens.filter(eachToken => eachToken.token !== token);
    await user.save();
    res.status(200).send({ auth: false });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const logoutall: RequestHandler = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send({ auth: false });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

router.post('', addUser);
router.post('/login', login);
router.post('/logout', guard, logout);
router.post('/logoutall', guard, logoutall);
router.delete('/:email', deleteUser);

export default router;
