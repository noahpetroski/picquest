import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Slot, router } from 'expo-router';
import { useEffect, useState } from 'react';

function Authorize() {
  const { authenticated } = useStrava();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(()  => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('authenticated:', authenticated, 'ready:', ready);
    if (!ready) {
      return;
    }

    console.log('Navigating, authenticated:', authenticated);

    if (authenticated) {
      console.log('About to navigate to tabs');
      setTimeout(() => router.replace('/(tabs)'), 0);
    } else {
      setTimeout(() => router.replace('/welcome'), 0);
    }
  }, [authenticated, ready]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <StravaProvider>
      <Authorize />
    </StravaProvider>
  );
}
