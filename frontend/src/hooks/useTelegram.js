import { useEffect, useState } from 'react';

function resolveUser() {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  const fromTg = tg?.initDataUnsafe?.user;
  if (fromTg?.id != null) return fromTg;
  if (tg) {
    return {
      id: 88888888,
      first_name: '访客',
      username: 'guest',
      is_premium: false,
    };
  }
  return {
    id: 88888888,
    first_name: 'CryptoUser',
    username: 'CryptoUser_88',
    is_premium: false,
  };
}

export function useTelegram() {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(resolveUser);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setWebApp(tg);
      const u = tg.initDataUnsafe?.user;
      if (u?.id != null) setUser(u);
      else
        setUser({
          id: 88888888,
          first_name: '访客',
          username: 'guest',
          is_premium: false,
        });
    }
  }, []);

  return {
    webApp,
    user,
    platform: webApp?.platform || 'unknown',
    colorScheme: webApp?.colorScheme || 'dark',
  };
}
