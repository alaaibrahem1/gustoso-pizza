import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/server/db';
import { hashPassword, signToken } from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, confirmPassword } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await dbService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: 'CUSTOMER',
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json(
      {
        message: 'Account registered successfully',
        token,
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
