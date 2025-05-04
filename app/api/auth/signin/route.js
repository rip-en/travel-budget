import User from '../../../models/User'; // Adjust path
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { emailOrUsername, password } = await request.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: 'Email/Username and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Set cookie
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 