import { queryKeys } from './queryClient';

export async function syncCompanyBillingCache(queryClient, payload) {
  if (payload && typeof payload === 'object') {
    queryClient.setQueryData(queryKeys.companyBilling, payload);
  }
  await queryClient.refetchQueries({
    queryKey: queryKeys.companyBilling,
    type: 'active',
  });
}
