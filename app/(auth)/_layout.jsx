import { useRouter, Slot } from 'expo-router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AuthLayout() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/menus');
    }
  }, [user]);

  if (user) return null;

  return <Slot />;
}
