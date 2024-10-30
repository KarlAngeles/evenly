'use server'

import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from 'zod'

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
})

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(key);
}

export async function decrypt(session: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    console.log('Failed to verify session', error);
    return null;
  }
}

export async function login(formData: FormData) {
  // Verify credentials && get the user
  const data = await fetch("http://backend:3000/api/v1/auth/sign_in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });

  if (data.status != 200) {
    return { error: 'Invalid login credentials.' };
  }

  const user = await data.json();
  const authorization = data.headers.get("authorization");

  // Create the session
  const expires = new Date(Date.now() + 3600 * 1000 * 24 * 365);
  const session = await encrypt({ user, authorization, expires });

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });

  redirect("/dashboard");
  return { success: 'User successfully logged in' };
}

export async function signup(formData: FormData) {
  const validatedFields = signupSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  })

  if (!validatedFields.success) {
    return { error: 'Invalid fields', details: validatedFields.error.flatten().fieldErrors }
  }

  // Verify credentials && get the user
  const data = await fetch("http://backend:3000/api/v1/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      password_confirmation: formData.get("confirmPassword"),
    }),
  });

  const response = await data.json();
  const error_msg = response?.errors?.full_messages || 'An error occurred while creating your account.'

  if (data.status != 200) {
    return { error: error_msg }
  };

  redirect("/login");
  return { success: 'User created successfully' };
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });

  redirect("/login");
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
