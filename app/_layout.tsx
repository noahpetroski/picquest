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
    if (!ready) {
      return;
    }

    if (authenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/welcome');
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
