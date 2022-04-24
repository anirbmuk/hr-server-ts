import { NextFunction, Request, Response } from 'express';
import { User, IUser } from './../models';
import jwt from 'jsonwebtoken';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      token: string;
      user: IUser;
    }
  }
}

const client_secret = process.env.hr_server_client_secret || '';

const allowedActions = {
  HR_ADMIN: ['GET', 'POST', 'PATCH', 'DELETE'],
  HR_MANAGER: ['GET', 'POST', 'PATCH'],
  HR_EMPLOYEE: ['GET'],
};

const guard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authheader = req.header('Authorization');
    if (!authheader || !authheader.startsWith('Bearer ')) {
      return res
        .status(401)
        .send({ error: 'Cannot authenticate incoming request' });
    }
    const token = authheader.split(' ')[1];
    const decoded = jwt.verify(token, client_secret) as { _id: string };

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user) {
      return res
        .status(401)
        .send({ error: 'Cannot authenticate incoming request' });
    }

    const { method, baseUrl } = req;
    const { role } = user;

    if (method !== 'GET' && !baseUrl.endsWith('users')) {
      if (allowedActions[role].indexOf(method) < 0) {
        return res
          .status(401)
          .send({ error: `User is not authorized to ${method} data` });
      }
    }

    req.token = token;
    req.user = user;
    next();
  } catch (_: unknown) {
    return res
      .status(401)
      .send({ error: 'Cannot authenticate incoming request' });
  }
};

export default guard;
