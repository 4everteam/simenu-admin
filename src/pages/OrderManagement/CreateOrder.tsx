import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { getProducts } from '../../fetch/product-management';
import { getCategories } from '../../fetch/categories-management'; 
import { orderMenu, getOrderDetail } from '../../fetch/order-management';
import { formatRupiah } from '../../utils/formatCurrency';
import { set } from 'lodash';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: {
    id: string;
    name: string;
  };
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

interface OrderItems {
  id: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    description: string;
  },
  quantity: number,
  notes: string,
  status: string
}

interface OrderDetails {
  order_id: string;
  table_id: number;
  table_code: string,
  on_behalf: string,
  type: string,
  status: string
  created_at: string,
  updated_at: string,
  items: OrderItems[],
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    amount_paid: number;
    tips: number;
    created_at: string;
    updated_at: string;
  },
  total_amount: number;
}

const CreateOrder = () => {
  let { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [orderType, setOrderType] = useState<string>('take_away');
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const cartRef = useRef<HTMLDivElement>(null);
  const [isCartSticky, setIsCartSticky] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState<boolean>(false);

  id = id?.replace(/\|/g, '/');

  // Fetch order details if ID exists
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        const orderDetails = await getOrderDetail({ id : id.replace(/\//g, '|')});
        if (orderDetails) {
          setIsUpdateMode(true);
          setCustomerName(orderDetails.on_behalf);
          setOrderType(orderDetails.type);
          setIsOrderCompleted(orderDetails.status === 'completed');

          // Map order items to cart items
          const mappedCartItems = (orderDetails).items.map((item: OrderItems) => ({
            ...item.product,
            quantity: item.quantity,
            notes: item.notes || ''
          }));
          
          setCartItems(mappedCartItems);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Fetch menu items and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [menuResponse, categoriesResponse] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        if (menuResponse && categoriesResponse) {
          // Filter only available items
          const availableItems = (menuResponse as MenuItem[]) .filter(item  => item.is_available);
          setMenuItems(availableItems);
          setFilteredItems(availableItems);
          setCategories(categoriesResponse);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter menu items based on category and search query
  useEffect(() => {
    let filtered = [...menuItems];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category.id === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle sticky cart on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (cartRef.current) {
        const cartPosition = cartRef.current.getBoundingClientRect().top;
        setIsCartSticky(cartPosition <= 80); // 80px from top (accounting for header)
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [itemId]: note
    }));
  };

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      // Check if item already exists in cart
      const existingItemIndex = prev.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prev, {
          ...item,
          quantity: 1,
          notes: notes[item.id] || ''
        }];
      }
    });
    
    // Clear note after adding to cart
    setNotes(prev => ({
      ...prev,
      [item.id]: ''
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      setError('Please add items to your order');
      return;
    }

    if (customerName.trim() === '') {
      setError('Tolong masukkan nama pelanggan');
      return;
    }
    
    try {
      setOrderLoading(true);
      setError(null);
    
      const orderData = {
        id: id || undefined,
        on_behalf: customerName,
        order_type: orderType,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      };
      
      // Use orderMenu for both create and update
      const response = await orderMenu(orderData);
      if (response && typeof response === 'object' && 'errors' in response) {
        if (Array.isArray(response.errors)) {
          setError(response.errors.join(', '));
        } else if (typeof response.errors === 'object') {
          setError(Object.values(response.errors).join(', '));
        } else if (typeof response.errors === 'string') {
          setError(response.errors);
        }else{
          throw new Error(`Failed to ${isUpdateMode ? 'update' : 'create'} order`);
        }
      }else{
        navigate(`/admin/kelola-pesanan`);
      }
    } catch (err) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'creating'} order:`, err);
      setError(err instanceof Error ? err.message : `An error occurred while ${isUpdateMode ? 'updating' : 'creating'} the order`);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleOnBehalfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
  }

  const OrderPreview = () => (
    <div className="col-span-12">
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
            Order Details (Completed)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
              <p className="font-medium text-black dark:text-white">{customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order Type</p>
              <p className="font-medium text-black dark:text-white capitalize">
                {orderType.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
            Order Items
          </h4>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start border-b border-stroke pb-4 dark:border-strokedark">
                <div className="h-20 w-20 rounded-lg overflow-hidden mr-4">
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/api/v1/file/${item.image_url}`}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-black dark:text-white">{item.name}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRupiah(item.price)} x {item.quantity}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-stroke pt-4 dark:border-strokedark">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-black dark:text-white">
              {formatRupiah(calculateTotal())}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-dashed">
            <span className="font-medium text-black dark:text-white">Total</span>
            <span className="font-bold text-xl text-primary">
              {formatRupiah(calculateTotal() * 1.1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render loading state
  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Buat pesanan" />
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName={isUpdateMode ? "Update Pesanan" : "Buat Pesanan"} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {isOrderCompleted ? (
          <OrderPreview />
        ) : (
          <>
            {/* Menu Items Section - 8 columns on desktop, full width on mobile */}
            <div className="col-span-12 lg:col-span-8">
              {/* Error message */}
              {error && (
                <div className="mb-6 bg-danger bg-opacity-10 text-danger px-4 py-3 rounded">
                  {error}
                  <button 
                    onClick={() => setError(null)}
                    className="float-right text-danger hover:text-opacity-80"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Search and Filter Section */}
              <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      placeholder="Search menu items..."
                      onChange={handleSearchChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                    <span className="absolute left-3 top-3.5 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      value={customerName}
                      type="text"
                      placeholder="Customer name..."
                      onChange={handleOnBehalfChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                    <span className="absolute left-3 top-3.5 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                {/* Order Type Selection */}
                <div className="mt-4 flex items-center space-x-4">
                  <span className="text-sm font-medium text-black dark:text-white">Order Type:</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        value="dine_in"
                        checked={orderType === 'dine_in'}
                        onChange={() => setOrderType('dine_in')}
                        className="mr-2 h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Dine In</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        value="take_away"
                        checked={orderType === 'take_away'}
                        onChange={() => setOrderType('take_away')}
                        className="mr-2 h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Take Away</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Categories Section */}
              <div className="mb-6 overflow-x-auto">
                <div className="inline-flex space-x-2 pb-2 min-w-max">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === 'all'
                        ? 'bg-[#6A1B4D] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4'
                    }`}
                  >
                    All
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        selectedCategory === category.id
                          ? 'bg-[#6A1B4D] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Menu Items Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden"
                    >
                      {/* Item Image */}
                      <div className="h-40 overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/api/v1/file/${item.image_url}` || ''}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                          }}
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="p-4">
                        <h5 className="text-lg font-semibold text-black dark:text-white mb-1">
                          {item.name}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-primary font-medium mb-3">
                          {formatRupiah(item.price)}
                        </p>
                        
                        {/* Notes Input */}
                        <div className="mb-3">
                          <input
                            type="text"
                            placeholder="Add notes..."
                            value={notes[item.id] || ''}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            className="w-full rounded border-stroke bg-transparent py-2 px-3 text-sm outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          />
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full inline-flex items-center justify-center rounded-md bg-[#6A1B4D] py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add to Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-sm border border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No menu items found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try changing your search or category filter</p>
                </div>
              )}
            </div>
            
            {/* Order Summary Section - 4 columns on desktop, full width on mobile */}
            <div className="col-span-12 lg:col-span-4">
              <div 
                ref={cartRef}
                className={`rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
                  isCartSticky ? 'lg:sticky lg:top-24' : ''
                }`}
              >
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Order Summary
                  </h3>
                </div>
                
                <div className="p-6.5">
                  {/* Cart Items */}
                  <div className="mb-6 max-h-96 overflow-y-auto">
                    {cartItems.length > 0 ? (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-start justify-between pb-4 border-b border-stroke dark:border-strokedark">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="h-16 w-16 rounded-md overflow-hidden">
                                <img
                                  src={`${import.meta.env.VITE_SERVER_URL}/api/v1/file/${item.image_url}` || ''}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '';
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-black dark:text-white">
                                  {item.name}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatRupiah(item.price)} x {item.quantity}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Note: {item.notes}
                                  </p>
                                )}
                                
                                {/* Edit Notes */}
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    placeholder="Update notes..."
                                    value={item.notes}
                                    onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                                    className="w-full rounded border-stroke bg-transparent py-1 px-2 text-xs outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <p className="font-medium text-primary">
                                {formatRupiah(item.price * item.quantity)}
                              </p>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                  className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-meta-3"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="text-sm font-medium text-black dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                  className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-meta-3"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs text-danger hover:text-opacity-80"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">Your order is empty</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add items from the menu</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Summary */}
                  {cartItems.length > 0 && (
                    <div className="space-y-4">
                      <div className="border-t border-stroke pt-4 dark:border-strokedark">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                          <span className="font-medium text-black dark:text-white">{formatRupiah(calculateTotal())}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-stroke dark:border-strokedark">
                          <span className="font-medium text-black dark:text-white">Total</span>
                          <span className="font-bold text-lg text-primary">{formatRupiah(calculateTotal())}</span>
                        </div>
                      </div>
                      
                      {/* Create Order Button */}
                      <button
                        onClick={handleCreateOrder}
                        disabled={orderLoading || cartItems.length === 0}
                        className="w-full flex justify-center items-center rounded-md bg-[#6A1B4D] py-3 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                      >
                        {orderLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isUpdateMode ? 'Updating Order...' : 'Creating Order...'}
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {isUpdateMode ? 'Update Order' : 'Create Order'}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CreateOrder;