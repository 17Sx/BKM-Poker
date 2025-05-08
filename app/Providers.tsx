'use client';

import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Force l'hydratation côté client
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
} 