import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';

function generateTokens(user: any) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  const refreshToken = jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn as any,
  });

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, phone, role } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role === 'admin' ? 'admin' : role === 'operator' ? 'operator' : 'driver';

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      phone,
      role: userRole,
    });

    const tokens = generateTokens(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const tokens = generateTokens(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        preferences: user.preferences,
      },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as any;
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }

    const tokens = generateTokens(user);
    res.status(200).json(tokens);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, preferences } = req.body;
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Transparent response: simulate reset code without leaking user enumeration
    console.log(`[PasswordReset] Password reset requested for: ${email}`);
    res.status(200).json({
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (err) {
    next(err);
  }
}
