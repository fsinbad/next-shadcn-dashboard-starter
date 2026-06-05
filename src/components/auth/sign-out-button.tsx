'use client';

import { useAuthContext } from './auth-provider';

interface SignOutButtonProps {
  children?: React.ReactNode;
}

export function SignOutButton({ children }: SignOutButtonProps) {
  const { signOut } = useAuthContext();

  return (
    <button type='button' onClick={() => signOut()}>
      {children ?? 'Sign out'}
    </button>
  );
}
