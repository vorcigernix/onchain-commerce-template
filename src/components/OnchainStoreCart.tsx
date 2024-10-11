import { useCallback, useMemo } from 'react';
import { useOnchainStoreContext } from './OnchainStoreProvider';
import { Pay, PayButton } from '@coinbase/onchainkit/pay';
import type { LifecycleStatus } from '@coinbase/onchainkit/pay';
import useCreateCharge from 'src/hooks/useCreateCharge';

export default function OnchainStoreCart() {
  const { quantities, products } = useOnchainStoreContext();

  const { createCharge } = useCreateCharge();

  const totalSum = useMemo(() => {
    return (
      products?.reduce(
        (sum, product) => sum + (quantities[product.id] || 0) * product.price,
        0,
      ) || 0
    );
  }, [products, quantities]);

  const handleStatusChange = useCallback((status: LifecycleStatus) => {
    console.log('onStatus', status);
  }, []);

  const chargeHandler = useCallback(() => {
    const description = Object.keys(quantities)
      .map((productId) => {
        return `${productId}(${quantities[productId]})`;
      })
      .join(',');
    const chargeDetails = {
      name: 'commerce template charge',
      description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: totalSum.toString(),
        currency: 'USD',
      },
    };
    return createCharge(chargeDetails);
  }, [createCharge, quantities, totalSum]);

  return (
    <div className="fixed bottom-0 bg-white border-t border-gray-200 w-screen left-1/2 right-1/2 -mx-[50vw]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4">
          <span className="text-xs text-gray-500 mb-2 md:mb-0 md:w-1/3 lg:pl-8">
            Built with OnchainKit
          </span>
          <div className="w-full md:w-2/3 flex justify-between items-center md:pl-5 xl:pr-0 pr-8">
            <h2 className="text-lg md:w-11/12 font-bold ">
              TOTAL {totalSum.toFixed(2)} USDC
            </h2>
            <div className="w-64">
              <Pay onStatus={handleStatusChange} chargeHandler={chargeHandler}>
                <PayButton
                  coinbaseBranded={true}
                  text="Pay with Crypto"
                  disabled={!totalSum}
                />
              </Pay>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
