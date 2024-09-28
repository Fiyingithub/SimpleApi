import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/user.js';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

class UserController {
    static async signup(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                username,
                email,
                password: hashedPassword,
                isConfirmed: false // Ensure this field is in your schema
            });

            await user.save();
            res.status(201).json({ message: 'User created. Please confirm your email.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            if (!user.isConfirmed) {
                return res.status(400).json({ message: 'Please confirm your email first' });
            }

            const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

            res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async confirm(req, res) {
        try {
            const { token } = req.params;
            const decoded = jwt.verify(token, jwtSecret);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(400).json({ message: 'Invalid token' });
            }

            user.isConfirmed = true;
            await user.save();

            res.json({ message: 'Email confirmed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async dashboard(req, res) {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static authMiddleware(req, res, next) {
        const token = req.header('Authorization')?.replace('Bearer ', '');
    
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded;
            next();
        } catch (err) {
            console.error(err);
            res.status(401).json({ message: 'Token is not valid' });
        }
    }
}

export default UserController;
