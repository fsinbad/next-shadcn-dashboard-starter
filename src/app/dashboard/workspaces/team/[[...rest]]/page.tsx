'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useOrganization, useUser } from '@/hooks/use-auth';
import { teamInfoContent } from '@/config/infoconfig';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  user_name: string | null;
  user_email: string | null;
  user_avatar: string | null;
}

export default function TeamPage() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = members.find((m) => m.user_id === user?.id)?.role === 'admin';

  const loadMembers = () => {
    if (!organization?.id) return;
    fetch('/api/teams')
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, [organization?.id]);

  const inviteLink = organization?.id
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/workspaces/team/join?org=${organization.id}`
    : '';

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return;
    try {
      const res = await fetch(`/api/teams/${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Member removed');
        loadMembers();
      } else {
        let msg = 'Failed to remove';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {
          msg = res.statusText || msg;
        }
        toast.error(msg);
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
      pageHeaderAction={
        isAdmin && (
          <Button onClick={copyInviteLink} disabled={!organization}>
            Invite Member
          </Button>
        )
      }
    >
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{organization?.name || 'Organization'}</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-4'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-48' />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && members.length === 0 && (
              <p className='text-muted-foreground'>No members found.</p>
            )}

            {!loading && (
              <div className='space-y-4'>
                {members.map((m) => (
                  <div key={m.id} className='flex items-center gap-4'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={m.user_avatar || ''} alt={m.user_name || ''} />
                      <AvatarFallback>
                        {m.user_name?.slice(0, 2)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        {m.user_name || 'Unnamed'}
                        {m.user_id === user?.id && (
                          <span className='text-muted-foreground ml-1 text-xs'>(you)</span>
                        )}
                      </p>
                      <p className='text-muted-foreground text-xs'>{m.user_email || 'No email'}</p>
                    </div>
                    <Badge
                      variant={m.role === 'admin' ? 'default' : 'secondary'}
                      className='capitalize'
                    >
                      {m.role}
                    </Badge>
                    {isAdmin && m.user_id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <Icons.ellipsis className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleRemove(m.user_id)}
                          >
                            <Icons.trash className='mr-2 h-4 w-4' />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
