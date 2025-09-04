import { useUserStore } from '@/stores/userStore';
import { useEnterpriseStore } from '@/stores/enterpriseStore';
import { useEffect } from 'react';


export function useStoreInitializer() {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const userEnterprise = useEnterpriseStore(state => state.userEnterprise);
  const enterprises = useEnterpriseStore(state => state.enterprises);

  const fetchUserEnterprise = useEnterpriseStore(state => state.fetchUserEnterprise);
  const fetchEnterprises = useEnterpriseStore(state => state.fetchEnterprises);

  useEffect(() => {
    if (enterprises.length === 0) {
      fetchEnterprises();
    }
  }, [enterprises.length, fetchEnterprises]);

  useEffect(() => {
    if (isAuthenticated && !userEnterprise) {
      fetchUserEnterprise();
    }
  }, [isAuthenticated, userEnterprise, fetchUserEnterprise]);

  return null;
}

export function StoreInitializer() {
  useStoreInitializer();
  return null;
} 