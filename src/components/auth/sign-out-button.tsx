'use client';

import { useAuthContext } from './auth-provider';

interface SignOutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function SignOutButton({ children, className }: SignOutButtonProps) {
  const { signOut } = useAuthContext();

  return (
    <span
      role='button'
      tabIndex={0}
      className={className}
      onClick={() => signOut()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          signOut();
        }
      }}
    >
      {children ?? 'Sign out'}
    </span>
  );
}
