/**
 * Client-side App Providers Wrapper
 * This component ensures providers are only initialized on the client side
 */

'use client';

import React, { ReactNode } from 'react';
import { getEnvironmentProviders } from '@/presentation';

interface ClientAppProvidersProps {
  children: ReactNode;
}

export function ClientAppProviders({ children }: ClientAppProvidersProps) {
  const AppProviders = getEnvironmentProviders();
  
  return <AppProviders>{children}</AppProviders>;
}