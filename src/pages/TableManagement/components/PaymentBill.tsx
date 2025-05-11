import { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '../../../utils/formatCurrency';
import { getOrderItems } from '../../../fetch/order-management';
import { processPayment } from '../../../fetch/payment-management';
import { useNavigate } from 'react-router-dom';

interface PaymentBillProps {
  tableCode: string;
  onPaymentComplete?: () => void;
}

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  status: string;
}

interface Order {
  order_id: string;
  items: OrderItem[];
  total_amount: string | number;
  status: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

const PaymentBill = ({ tableCode, onPaymentComplete }: PaymentBillProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash' },
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'debit_card', name: 'Debit Card' },
    { id: 'qris', name: 'QRIS' },
  ];

  // Fetch order data
  const fetchOrderData = useCallback(async () => {
    if (!tableCode) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getOrderItems({ code: tableCode });
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Get the most recent active order
        const activeOrder = response.find(order => order.status !== 'completed');
        
        if (activeOrder) {
          setOrder(activeOrder);
        } else if (response.length > 0) {
          // If no active order, use the most recent one
          setOrder(response[0]);
          setPaymentSuccess(response[0].status === 'completed');
        } else {
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Error fetching order data:', err);
      setError('Failed to load order data');
    } finally {
      setLoading(false);
    }
  }, [tableCode]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  // Calculate change when amount paid changes
  useEffect(() => {
    if (!order || !amountPaid) {
      setChange(0);
      return;
    }
    
    const totalAmount = typeof order.total_amount === 'string' 
      ? parseInt(order.total_amount) 
      : order.total_amount;
    
    const paid = parseInt(amountPaid.replace(/[^\d]/g, ''));

    if (!isNaN(paid) && paid >= totalAmount) {
      setChange(paid - totalAmount);
    } else {
      setChange(0);
    }
  }, [amountPaid, order]);

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and format as currency
    const value = e.target.value;
    setAmountPaid(value);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleProcessPayment = async () => {
    if (!order || processingPayment) return;
    
    // Validate payment amount for cash payments
    if (paymentMethod === 'cash') {
      const totalAmount = typeof order.total_amount === 'string' 
        ? parseInt(order.total_amount) 
        : order.total_amount;
      
      const paid = parseInt(amountPaid.replace(/[^\d]/g, ''));
      
      if (isNaN(paid) || paid < totalAmount) {
        setError(`Jumlah pembayaran kurang dari total tagihan (${formatRupiah(totalAmount)})`);
        return;
      }
    }
    
    try {
      setProcessingPayment(true);
      setError(null);
      
      const paymentData = {
        orderId: order.order_id,
        paymentMethod,
        amountPaid : Number(amountPaid.replace(/[^\d]/g, '')),
      };
      
      const response = await processPayment(paymentData);
      
      if (response) {
        if (response && typeof response === 'object' && 'errors' in response) {
            if (Array.isArray(response.errors)) {
              setError(response.errors.join(', '));
            } else if (typeof response.errors === 'object') {
              console.log(response.errors);
              setError("Terjadi kesalahan");
            } else if (typeof response.errors === 'string') {
              setError(response.errors);
            }
        }else{
            setPaymentSuccess(true);
            // Call the callback if provided
            if (onPaymentComplete) {
              setTimeout(() => {
                onPaymentComplete();
              }, 1000);
            }

            // refresh page
            setTimeout(() => {
              navigate(0);
            }, 2000);
        }
      } else {
        throw new Error(response?.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Render no order state
  if (!order) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center py-8">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No active order found for this table</p>
        </div>
      </div>
    );
  }

  // Render payment success state
  if (paymentSuccess) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center py-8">
          <div className="bg-success bg-opacity-10 text-success rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-success mb-2">Payment Successful!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The payment has been processed successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Payment Bill
        </h3>
      </div>
      
      <div className="p-6.5">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-danger bg-opacity-10 text-danger px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Order summary */}
        <div className="mb-6 border-b border-stroke pb-6 dark:border-strokedark">
          <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Order Summary</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
              <span className="text-sm font-medium">{order.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
              <span className="text-sm font-medium">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Table:</span>
              <span className="text-sm font-medium">{tableCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`text-sm font-medium ${
                order.status === 'completed' 
                  ? 'text-success' 
                  : order.status === 'pending' 
                    ? 'text-warning' 
                    : 'text-danger'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Order items */}
        <div className="mb-6 border-b border-stroke pb-6 dark:border-strokedark">
          <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Order Items</h4>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(item.product.price)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatRupiah(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Total amount */}
        <div className="mb-6 border-b border-stroke pb-6 dark:border-strokedark">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-black dark:text-white">Total Amount:</span>
            <span className="text-lg font-bold text-primary">
              {formatRupiah(order.total_amount)}
            </span>
          </div>
        </div>
        
        {/* Payment method */}
        <div className="mb-6">
          <label className="mb-2.5 block text-black dark:text-white">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Amount paid (only for cash payment) */}
        <div className="mb-4">
            <label className="mb-2.5 block text-black dark:text-white">
            Amount Paid
            </label>
            <input
            type="text"
            value={amountPaid}
            onChange={handleAmountPaidChange}
            placeholder="Enter amount paid"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
        </div>
        
        <div className="mb-6">
            <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-black dark:text-white">Change:</span>
            <span className="text-sm font-medium text-success">
                {formatRupiah(change)}
            </span>
            </div>
        </div>
        
        {/* Process payment button */}
        <button
          onClick={handleProcessPayment}
          disabled={processingPayment || !amountPaid}
          className="w-full flex justify-center rounded bg-[#6A1B4D] py-3 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
        >
          {processingPayment ? 'Processing...' : 'Process Payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentBill;