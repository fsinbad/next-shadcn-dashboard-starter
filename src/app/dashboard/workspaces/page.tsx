'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { useOrganizationList, useAuth } from '@/hooks/use-auth';
import { workspacesInfoContent } from '@/config/infoconfig';
import { toast } from 'sonner';

export default function WorkspacesPage() {
  const { isLoaded, userMemberships, setActive } = useOrganizationList();
  const { orgId } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        setNewName('');
        setIsCreating(false);
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workspaces/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      if (res.ok) {
        setEditingId(null);
        window.location.reload();
      } else {
        let msg = 'Failed to update';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {
          msg = res.statusText || msg;
        }
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Workspace deleted');
        window.location.reload();
      } else {
        let msg = 'Failed to delete';
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
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
      pageHeaderAction={
        <Button onClick={() => setIsCreating(true)}>
          <Icons.add className='mr-2 h-4 w-4' />
          New Workspace
        </Button>
      }
    >
      <div className='space-y-4'>
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Workspace</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Workspace name'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <Button onClick={handleCreate} disabled={isSubmitting || !newName.trim()}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
                <Button variant='outline' onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoaded && userMemberships.data.length === 0 && !isCreating && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-10'>
              <Icons.workspace className='text-muted-foreground mb-4 h-10 w-10' />
              <p className='text-muted-foreground mb-4'>
                You are not a member of any workspace yet.
              </p>
              <Button onClick={() => setIsCreating(true)}>
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
                {editingId === membership.organization.id ? (
                  <div className='flex items-center gap-2 flex-1 mr-4'>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleUpdate(membership.organization.id)
                      }
                      className='h-8'
                      autoFocus
                    />
                    <Button size='sm' onClick={() => handleUpdate(membership.organization.id)}>
                      Save
                    </Button>
                    <Button size='sm' variant='outline' onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span>{membership.organization.name}</span>
                )}
                <div className='flex items-center gap-2'>
                  {membership.organization.id === orgId && (
                    <Icons.check className='h-5 w-5 text-primary' />
                  )}
                  {membership.role === 'admin' && editingId !== membership.organization.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icons.ellipsis className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditName(membership.organization.name);
                            setEditingId(membership.organization.id);
                          }}
                        >
                          <Icons.edit className='mr-2 h-4 w-4' />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(membership.organization.id);
                          }}
                        >
                          <Icons.trash className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
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
