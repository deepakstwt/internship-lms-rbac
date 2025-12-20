import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

const router = Router();

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    delete req.headers.authorization;
    
    const { email, password }: RegisterRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long',
      });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking user existence',
      });
    }

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await hashPassword(password);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        role: 'student',
        is_approved: true,
      })
      .select('id, email, role, created_at')
      .single();

    if (insertError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create user',
      });
    }

    const token = generateToken({
      userId: newUser.id,
      role: newUser.role as 'student',
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    delete req.headers.authorization;
    
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, password, role, is_approved')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    if (user.role === 'mentor' && !user.is_approved) {
      return res.status(403).json({
        status: 'error',
        message: 'Mentor account is pending approval',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role as 'student' | 'mentor' | 'admin',
    });

    return res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;


