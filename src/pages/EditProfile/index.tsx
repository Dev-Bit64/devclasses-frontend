/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, Save, User } from 'lucide-react';

import { getUserProfileAction, updateUserProfileAction } from '../../redux/action/userAction';
import { AppDispatch, RootState } from '../../redux/store';
import { PageShell } from '../../components/common/PageShell';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { Skeleton } from '../../components/ui/skeleton';
import { FormField } from '../../components/ui/form-field';
import { NativeSelect } from '../../components/ui/native-select';
import { toastText } from '../../utils/toast';

// Same rules the previous antd form enforced, transcribed message-for-message.
const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Please input your first name!'),
  lastName: z.string().trim().min(1, 'Please input your last name!'),
  email: z.string().trim().min(1, 'Please input a valid email!').email('Please input a valid email!'),
});

type ProfileValues = z.infer<typeof profileSchema>;

// Options are unchanged; both fields remain read-only, as before.
const STANDARD_OPTIONS = [
  { value: '10th Grade', label: '10th Grade' },
  { value: '11th Grade', label: '11th Grade' },
  { value: '12th Grade', label: '12th Grade' },
];

const BOARD_OPTIONS = [
  { value: 'State Board', label: 'State Board' },
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

const EditProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, data: userProfileData } = useSelector((state: RootState) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  // Reset isSubmitting when loading finishes
  useEffect(() => {
    if (!isLoading) {
      setIsSubmitting(false);
    }
  }, [isLoading]);

  // Get user ID from localStorage
  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('user');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
      return null;
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo?.id) {
      dispatch(getUserProfileAction(userInfo.id));
    }
  }, [dispatch]);

  // Update form when user profile data is received
  useEffect(() => {
    if (userProfileData?.data) {
      reset({
        firstName: userProfileData.data.firstName ?? '',
        lastName: userProfileData.data.lastName ?? '',
        email: userProfileData.data.email ?? '',
      });
    }
  }, [userProfileData, reset]);

  const onFinish = async (values: ProfileValues) => {
    setIsSubmitting(true);

    const userInfo = getUserInfo();

    if (userInfo?.id) {
      try {
        const payload = {
          userId: userInfo.id,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        }
        dispatch(updateUserProfileAction(payload));
      } catch (error: any) {
        console.log(error);
        toastText(error?.message ? error?.message : 'Failed to update profile. Please check the form.', 'error');
      }
    }
  };

  const onFinishFailed = () => {
    toastText('Failed to update profile. Please check the form.', 'error');
  };

  const profileName = `${userProfileData?.data?.firstName ?? ''} ${userProfileData?.data?.lastName ?? ''}`.trim();

  const breadcrumb = (
    <Breadcrumb
      items={[
        {
          label: (
            <>
              <Home aria-hidden="true" className="size-3.5" />
              Dashboard
            </>
          ),
          to: '/dashboard',
        },
        { label: 'Edit Profile' },
      ]}
    />
  );

  // Show loading skeleton when data is being fetched
  if (isLoading && !isSubmitting) {
    return (
      <PageShell className="max-w-4xl">
        {breadcrumb}
        <Card className="grid gap-8 p-5 sm:p-7 md:grid-cols-[240px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-32 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-12 w-40" />
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="max-w-4xl">
      {breadcrumb}

      <Card className="grid gap-8 p-5 sm:p-7 md:grid-cols-[240px_1fr]">
        {/* Identity panel */}
        <div className="flex flex-col items-center gap-3 text-center md:border-r md:border-border md:pr-8">
          <span
            aria-hidden="true"
            className="grid size-28 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground"
          >
            {getInitials(profileName)}
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="dc-h3">{profileName}</p>
            {userProfileData?.data?.role && (
              <p className="dc-caption capitalize">
                {String(userProfileData.data.role).toLowerCase()}
              </p>
            )}
          </div>
        </div>

        {/* Profile form */}
        <div className="flex flex-col gap-1.5">
          <h1 className="dc-h2 flex items-center gap-2">
            <User aria-hidden="true" className="size-5 text-primary" />
            Edit Profile
          </h1>
          <p className="dc-small">Update your profile information below.</p>

          <form
            noValidate
            onSubmit={handleSubmit(onFinish, onFinishFailed)}
            className="mt-6 flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="profile-firstName"
                label="First Name"
                required
                error={errors.firstName?.message}
              >
                {(aria) => (
                  <Input
                    {...aria}
                    {...register('firstName')}
                    placeholder="First Name"
                    autoComplete="given-name"
                    invalid={Boolean(errors.firstName)}
                  />
                )}
              </FormField>

              <FormField
                id="profile-lastName"
                label="Last Name"
                required
                error={errors.lastName?.message}
              >
                {(aria) => (
                  <Input
                    {...aria}
                    {...register('lastName')}
                    placeholder="Last Name"
                    autoComplete="family-name"
                    invalid={Boolean(errors.lastName)}
                  />
                )}
              </FormField>
            </div>

            <FormField
              id="profile-email"
              label="Email Address"
              required
              error={errors.email?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  {...register('email')}
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  invalid={Boolean(errors.email)}
                />
              )}
            </FormField>

            {/* Standard and Board stay read-only, exactly as before. */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="profile-standard"
                label="Standard"
                hint="Set when you registered."
              >
                {(aria) => (
                  <NativeSelect
                    {...aria}
                    disabled
                    options={STANDARD_OPTIONS}
                    value={userProfileData?.data?.standard ?? ''}
                    placeholder="Not set"
                    onChange={() => undefined}
                  />
                )}
              </FormField>

              <FormField id="profile-board" label="Board" hint="Set when you registered.">
                {(aria) => (
                  <NativeSelect
                    {...aria}
                    disabled
                    options={BOARD_OPTIONS}
                    value={userProfileData?.data?.board ?? ''}
                    placeholder="Not set"
                    onChange={() => undefined}
                  />
                )}
              </FormField>
            </div>

            <div>
              <Button type="submit" size="lg" disabled={isLoading && isSubmitting}>
                {isLoading && isSubmitting ? <Spinner /> : <Save aria-hidden="true" />}
                {isLoading && isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </PageShell>
  );
};

export default EditProfile;
