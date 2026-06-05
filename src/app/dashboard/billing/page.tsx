'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';

export default function BillingPage() {
  const { organization, isLoaded } = useOrganization();

  return (
    <PageContainer
      isLoading={!isLoaded}
      access={!!organization}
      accessFallback={
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-semibold'>No Organization Selected</h2>
            <p className='text-muted-foreground'>
              Please select or create an organization to view billing information.
            </p>
          </div>
        </div>
      }
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription={`Manage your subscription and usage limits for ${organization?.name}`}
    >
      <div className='space-y-6'>
        {/* Info Alert */}
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Billing is not configured. Connect your own payment provider (e.g., Stripe) to enable
            subscription management.
          </AlertDescription>
        </Alert>

        {/* Placeholder Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your organization's needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>$0 / month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='text-muted-foreground space-y-2 text-sm'>
                    <li>Up to 3 members</li>
                    <li>Basic features</li>
                    <li>Community support</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className='border-primary'>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>$29 / month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='text-muted-foreground space-y-2 text-sm'>
                    <li>Unlimited members</li>
                    <li>Advanced features</li>
                    <li>Priority support</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>Custom pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='text-muted-foreground space-y-2 text-sm'>
                    <li>Dedicated infrastructure</li>
                    <li>SSO / SAML</li>
                    <li>SLA guarantee</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
