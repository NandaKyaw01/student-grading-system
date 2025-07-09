'use client';

import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Camera,
  Eye,
  EyeOff,
  Loader,
  Loader2,
  Lock,
  Mail,
  Save,
  Upload,
  User,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import React, { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updatePassword, updateProfile, uploadAvatar } from '@/actions/account';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Zod schemas
const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address')
});

const passwordSchema = z
  .object({
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
      ),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type BreadcrumbProps = {
  name: string;
  link: string;
};

const breadcrumb: BreadcrumbProps[] = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'Account',
    link: ''
  }
];

// Loading skeleton component
const AccountPageSkeleton = () => (
  <div className='space-y-6'>
    {/* Header Skeleton */}
    <div className='space-y-2'>
      <Skeleton className='h-8 w-64' />
      <Skeleton className='h-4 w-96' />
    </div>

    <Separator />

    {/* Avatar Section Skeleton */}
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-32' />
        </div>
        <Skeleton className='h-4 w-80' />
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-6'>
          <Skeleton className='h-24 w-24 rounded-full' />
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Profile Section Skeleton */}
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-40' />
        </div>
        <Skeleton className='h-4 w-72' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-32' />
        </div>
      </CardContent>
    </Card>

    {/* Password Section Skeleton */}
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-36' />
        </div>
        <Skeleton className='h-4 w-64' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-36' />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function AccountPage() {
  const t = useTranslations('AdminNavBarTitle');
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useTransition hooks for different actions
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isAvatarPending, startAvatarTransition] = useTransition();

  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  React.useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || '',
        email: session.user.email || ''
      });
    }
  }, [session, profileForm]);

  // Loading state
  if (status === 'loading') {
    return (
      <ContentLayout
        title={t('account')}
        breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
      >
        <AccountPageSkeleton />
      </ContentLayout>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <ContentLayout
        title={t('account')}
        breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
      >
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            You need to be signed in to access account settings.
          </AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const user = session.user;

  // Avatar handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('File size must be less than 1MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsImageLoading(true); // Reset loading state
    setImageError(false); // Reset error state

    startAvatarTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', user.id);

        const result = await uploadAvatar(formData);

        if (result.success) {
          toast.success('Avatar updated successfully!');
          await update(); // Refresh session
          setAvatarPreview(null);
          setIsImageLoading(true); // Reset for new image
          setImageError(false);
          URL.revokeObjectURL(previewUrl);
        } else {
          toast.error(result.error || 'Failed to update avatar');
          setAvatarPreview(null);
          setImageError(true);
          URL.revokeObjectURL(previewUrl);
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        setAvatarPreview(null);
        setImageError(true);
        URL.revokeObjectURL(previewUrl);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const cancelAvatarPreview = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Profile submit handler with useTransition
  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user.id) {
      toast.error('User ID not found');
      return;
    }

    startProfileTransition(async () => {
      try {
        const result = await updateProfile(user.id, data);

        if (result.success) {
          toast.success('Profile updated successfully!');
          await update();
        } else {
          toast.error(result.error || 'Failed to update profile');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
      }
    });
  };

  // Password submit handler with useTransition
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!user.id) {
      toast.error('User ID not found');
      return;
    }

    startPasswordTransition(async () => {
      try {
        const result = await updatePassword(user.id, {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        });

        if (result.success) {
          toast.success('Password updated successfully!');
          passwordForm.reset();
        } else {
          toast.error(result.error || 'Failed to update password');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
      }
    });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ContentLayout
      title={t('account')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Account Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account information and security settings.
          </p>
        </div>

        <Separator />

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Camera className='h-5 w-5' />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Update your profile picture. Supported formats: JPG, PNG, GIF. Max
              size: 5MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-6'>
              <div className='relative'>
                <Avatar className='h-24 w-24'>
                  {!imageError && (user.image || avatarPreview) && (
                    <AvatarImage
                      src={avatarPreview || user.image || ''}
                      alt={user.name || 'User avatar'}
                      onLoad={() => setIsImageLoading(false)}
                      onError={() => {
                        setIsImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  )}
                  <AvatarFallback className='text-lg'>
                    {isImageLoading &&
                    (user.image || avatarPreview) &&
                    !imageError ? (
                      <Loader2 className='h-6 w-6 animate-spin' />
                    ) : user.name ? (
                      getInitials(user.name)
                    ) : (
                      'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                {isAvatarPending && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full'>
                    <Loader2 className='h-6 w-6 animate-spin text-white' />
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleAvatarClick}
                    disabled={isAvatarPending}
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    {isAvatarPending ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={cancelAvatarPreview}
                      disabled={isAvatarPending}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Click to upload a new profile picture
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleAvatarChange}
              className='hidden'
              disabled={isAvatarPending}
            />
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={profileForm.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your name'
                          disabled={isProfilePending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                          <Input
                            type='email'
                            placeholder='Enter your email'
                            className='pl-10'
                            disabled={isProfilePending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type='submit'
                  disabled={isProfilePending}
                  className='w-full md:w-auto'
                >
                  {isProfilePending ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Lock className='h-5 w-5' />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={passwordForm.control}
                  name='currentPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={showPasswords.current ? 'text' : 'password'}
                            placeholder='Enter your current password'
                            className='pr-10'
                            disabled={isPasswordPending}
                            {...field}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                            onClick={() => togglePasswordVisibility('current')}
                            disabled={isPasswordPending}
                          >
                            {showPasswords.current ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={showPasswords.new ? 'text' : 'password'}
                            placeholder='Enter your new password'
                            className='pr-10'
                            disabled={isPasswordPending}
                            {...field}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                            onClick={() => togglePasswordVisibility('new')}
                            disabled={isPasswordPending}
                          >
                            {showPasswords.new ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            placeholder='Confirm your new password'
                            className='pr-10'
                            disabled={isPasswordPending}
                            {...field}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                            onClick={() => togglePasswordVisibility('confirm')}
                            disabled={isPasswordPending}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type='submit'
                  disabled={isPasswordPending}
                  className='w-full md:w-auto'
                >
                  {isPasswordPending ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className='h-4 w-4 mr-2' />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
