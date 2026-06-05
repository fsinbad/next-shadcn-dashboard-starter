'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useAuth, useUser } from '@/hooks/use-auth';
import Link from 'next/link';

export default function JoinTeamPage() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get('org');
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [orgName, setOrgName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/workspaces/${orgId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.org) setOrgName(data.org.name);
      })
      .catch(() => setError('Failed to load organization'));
  }, [orgId]);

  const handleJoin = async () => {
    if (!orgId) return;
    setJoining(true);
    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId })
      });
      if (res.ok) {
        setJoined(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join');
      }
    } catch {
      setError('Network error');
    } finally {
      setJoining(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Icons.spinner className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Join Team</CardTitle>
            <CardDescription>Please sign in with DingTalk first</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground text-sm'>
              You need to be signed in to join {orgName || 'this team'}.
            </p>
            <Button asChild className='w-full'>
              <Link
                href={`/api/auth/dingtalk?redirect=/dashboard/workspaces/team/join?org=${orgId}`}
              >
                Sign in with DingTalk
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joined) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.check className='h-5 w-5 text-green-600' />
              Welcome!
            </CardTitle>
            <CardDescription>You have joined {orgName}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='/dashboard/workspaces'>Go to Workspaces</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Join Team</CardTitle>
          <CardDescription>
            {orgName ? `You have been invited to join ${orgName}` : 'Team invitation'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {user && (
            <p className='text-sm'>
              Signed in as <span className='font-medium'>{user.name || user.id}</span>
            </p>
          )}
          {error && <p className='text-sm text-red-500'>{error}</p>}
          <Button onClick={handleJoin} disabled={joining || !orgId} className='w-full'>
            {joining ? 'Joining...' : 'Accept & Join'}
          </Button>
          <Button variant='outline' asChild className='w-full'>
            <Link href='/dashboard/workspaces'>Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
