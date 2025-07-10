'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// Schemas for validation
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address')
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character'
    )
});

// Update user profile
export async function updateProfile(
  userId: string,
  data: z.infer<typeof updateProfileSchema>
) {
  try {
    // Validate input
    const validatedData = updateProfileSchema.parse(data);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if email is already taken by another user
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return { success: false, error: 'Email is already in use' };
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        updatedAt: new Date()
      }
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating profile:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    return { success: false, error: 'Failed to update profile' };
  }
}

// Update user password
export async function updatePassword(
  userId: string,
  data: z.infer<typeof updatePasswordSchema>
) {
  try {
    // Validate input
    const validatedData = updatePasswordSchema.parse(data);

    // Check if user exists and get current password
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, hashedPassword: true }
    });

    if (!existingUser || !existingUser.hashedPassword) {
      return { success: false, error: 'User not found or no password set' };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      existingUser.hashedPassword
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    return { success: false, error: 'Failed to update password' };
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const file = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return { success: false, error: 'Missing file or user ID' };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Validate file size (max 5MB)
    if (file.size > 1 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 1MB' };
    }

    // Create upload directory in tmp folder
    const uploadDir = path.join('/tmp', 'avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating tmp directory:', error);
      return { success: false, error: 'Unable to create upload directory' };
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${userId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file to tmp folder
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // Set image URL to API route
    const imageUrl = `/api/avatars/${fileName}`;

    // Update user with new image path
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: imageUrl,
        updatedAt: new Date()
      }
    });

    // Delete old avatar if it exists
    if (existingUser.image) {
      await deleteOldAvatar(existingUser.image);
    }

    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, error: 'Failed to upload avatar' };
  }
}

// Helper function to delete old avatar from tmp folder
async function deleteOldAvatar(oldImagePath: string) {
  try {
    if (oldImagePath.startsWith('/api/avatars/')) {
      const fileName = oldImagePath.split('/').pop();
      if (fileName) {
        const oldFilePath = path.join('/tmp', 'avatars', fileName);
        await fs.unlink(oldFilePath);
        console.log('Old avatar deleted:', oldImagePath);
      }
    }
  } catch (error) {
    console.error('Error deleting old avatar:', error);
    // Don't throw error, just log it
  }
}

// Get user profile (helper function)
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}
