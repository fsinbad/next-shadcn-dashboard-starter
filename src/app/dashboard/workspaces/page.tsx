'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useOrganizationList, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { workspacesInfoContent } from '@/config/infoconfig';

export default function WorkspacesPage() {
  const router = useRouter();
  const { isLoaded, userMemberships, setActive } = useOrganizationList();
  const { orgId } = useAuth();

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <div className='space-y-4'>
        {isLoaded && userMemberships.data.length === 0 && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-10'>
              <Icons.workspace className='text-muted-foreground mb-4 h-10 w-10' />
              <p className='text-muted-foreground mb-4'>
                You are not a member of any workspace yet.
              </p>
              <Button onClick={() => router.push('/dashboard/workspaces/team')}>
                <Icons.add className='mr-2 h-4 w-4' />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        )}

        {userMemberships.data.map((membership) => (
          <Card
            key={membership.id}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              membership.organization.id === orgId ? 'border-primary' : ''
            }`}
            onClick={() => setActive({ organization: membership.organization.id })}
          >
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>{membership.organization.name}</span>
                {membership.organization.id === orgId && (
                  <Icons.check className='h-5 w-5 text-primary' />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>
                Role: <span className='font-medium capitalize'>{membership.role}</span>
              </p>
              <p className='text-muted-foreground text-sm'>Slug: {membership.organization.slug}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
