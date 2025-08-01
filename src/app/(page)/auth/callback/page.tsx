'use client';

import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function AuthCallbackPage() {
  const router = useRouter();
  const { instance } = useMsal();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Handle the redirect response
        const response = await instance.handleRedirectPromise();
        
        if (response) {
          // Authentication successful, redirect to dashboard
          router.replace(paths.dashboard.root);
        } else {
          // No response, redirect to sign-in
          router.replace(paths.auth.signIn);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace(paths.auth.signIn);
      }
    };

    handleRedirect();
  }, [instance, router]);

  return <SplashScreen />;
}
