'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@/hooks/use-auth';
import { teamInfoContent } from '@/config/infoconfig';

export default function TeamPage() {
  const { organization, isLoaded } = useOrganization();

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{organization?.name || 'Organization'}</CardTitle>
            <CardDescription>Manage your team members and workspace settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Team management UI is not yet implemented. Add member invitation, role management, and
              workspace settings here.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
