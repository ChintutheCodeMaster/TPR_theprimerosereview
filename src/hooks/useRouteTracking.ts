import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouteTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/home') {
      sessionStorage.setItem('isUKUser', 'true');
    }
  }, [location.pathname]);

  const isUKUser = () => {
    return sessionStorage.getItem('isUKUser') === 'true';
  };

  const getPlansRoute = () => {
    return isUKUser() ? '/plansuk' : '/plans';
  };

  const getHomeRoute = () => {
    return isUKUser() ? '/home' : '/';
  };

  return { isUKUser, getPlansRoute, getHomeRoute };
};
