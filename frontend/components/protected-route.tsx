'use client';

import * as React from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Route guards removed - allow access without authentication
  return <>{children}</>;
}
