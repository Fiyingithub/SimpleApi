import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
// import routes from './api/routes/index.js';
import UserController from './api/controllers/userController.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB = process.env.DATABASE || 'mongodb://localhost:27017/testdb';

mongoose.connect(DB)
.then(() => console.log('Connected to the database successfully'))
.catch((err) => console.log('Database connection failed', err));

// app.use('/api', routes);

app.post('/signup', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  UserController.signup(req, res, next);
});

app.post('/login', UserController.login);
app.get('/confirm/:token', UserController.confirm);
app.get('/dashboard', UserController.authMiddleware, UserController.dashboard);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

export default app;
