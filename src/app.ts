import express, { NextFunction, Request, Response } from 'express';
import { json } from 'body-parser';
import './database/mongodb';

import userRoutes from './routes/user.route';
import locationRoutes from './routes/location.route';
import departmentRoutes from './routes/department.route';
import employeeRoutes from './routes/employee.route';
import jobRoutes from './routes/job.route';

const base_path = process.env.hr_server_base_path;

const allowedOrigins = [
  'http://localhost:8000',
  'https://menj-stack.herokuapp.com',
];

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const { origin } = req.headers;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, accept-language',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, PUT, OPTIONS',
  );
  next();
});

app.use(json());

app.use(base_path + 'users', userRoutes);
app.use(base_path + 'locations', locationRoutes);
app.use(base_path + 'departments', departmentRoutes);
app.use(base_path + 'employees', employeeRoutes);
app.use(base_path + 'jobs', jobRoutes);

export default app;
