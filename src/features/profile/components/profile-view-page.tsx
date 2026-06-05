'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-auth';

export default function ProfileViewPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className='flex w-full flex-col p-4'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Loading your profile...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex w-full flex-col p-4'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col p-4'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={user.avatarUrl || ''} alt={user.name || ''} />
                <AvatarFallback className='text-lg'>
                  {user.name?.slice(0, 2)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-lg font-medium'>{user.name || 'Unnamed User'}</p>
                <p className='text-muted-foreground text-sm'>{user.email || 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
