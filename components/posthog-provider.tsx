'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

// Dynamically import posthog only on client-side
let posthog: any = null;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && !isInitialized) {
      // Dynamically import posthog
      import('posthog-js').then((module) => {
        posthog = module.default;
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: true,
          loaded: () => {
            setIsInitialized(true);
          },
        });
      });
    }
  }, [isInitialized]);

  return <>{children}</>;
}

export function PostHogIdentifier() {
  const { user } = useUser();

  useEffect(() => {
    if (user && typeof window !== 'undefined' && posthog) {
      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
      });
    }
  }, [user]);

  return null;
}
