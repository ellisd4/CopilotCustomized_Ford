import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';
import CartItem from './CartItem';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cartData, loading, error, refreshCart } = useCart();
  const { darkMode } = useTheme();
  const [couponCode, setCouponCode] = useState('');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${darkMode ? 'bg-red-900 border-red-700 text-red-300' : ''}`}>
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  const isEmpty = !cartData || cartData.items.length === 0;

  const handleApplyCoupon = () => {
    console.log('Applying coupon:', couponCode);
    // Coupon logic would be implemented here
  };

  const handleUpdateCart = async () => {
    try {
      await refreshCart();
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  // Calculate pricing
  const subtotal = cartData?.totalPrice || 0;
  const discountRate = 0.05; // 5% discount
  const discountAmount = subtotal * discountRate;
  const shipping = 10;
  const grandTotal = subtotal - discountAmount + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {isEmpty ? (
          <div className="text-center py-16">
            <svg 
              className="mx-auto h-24 w-24 mb-4 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M13 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" 
              />
            </svg>
            <h3 className="text-xl font-medium mb-2 text-white">
              Your cart is empty
            </h3>
            <p className="mb-6 text-gray-400">
              Add some items to your cart to get started.
            </p>
            <Link 
              to="/products" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Table */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-4 text-left text-white font-semibold">S. No.</th>
                        <th className="px-4 py-4 text-left text-white font-semibold">Product Image</th>
                        <th className="px-4 py-4 text-left text-white font-semibold">Product Name</th>
                        <th className="px-4 py-4 text-left text-white font-semibold">Unit Price</th>
                        <th className="px-4 py-4 text-center text-white font-semibold">Quantity</th>
                        <th className="px-4 py-4 text-left text-white font-semibold">Total</th>
                        <th className="px-4 py-4 text-center text-white font-semibold">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartData.items.map((item, index) => (
                        <CartItem key={item.cartItemId} item={item} index={index + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coupon and Update Cart */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon Code"
                    className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-600 flex-grow sm:w-64"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors whitespace-nowrap"
                  >
                    Apply Coupon
                  </button>
                </div>
                <button
                  onClick={handleUpdateCart}
                  className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors w-full sm:w-auto"
                >
                  Update Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Discount(5%)</span>
                    <span className="font-semibold text-red-400">-${discountAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span className="font-semibold">${shipping.toFixed(2)}</span>
                  </div>
                  
                  <hr className="border-gray-700" />
                  
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Grand Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-semibold transition-colors text-lg">
                  Proceed To Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}