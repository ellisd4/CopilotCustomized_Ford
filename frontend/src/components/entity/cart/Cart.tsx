
import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';
import CartItem from './CartItem';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cartData, loading, error, clearCart } = useCart();
  const { darkMode } = useTheme();

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

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
            Shopping Cart
          </h1>
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                darkMode 
                  ? 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white' 
                  : 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="text-center py-16">
            <svg 
              className={`mx-auto h-24 w-24 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} 
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
            <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              Your cart is empty
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add some items to your cart to get started.
            </p>
            <Link 
              to="/products" 
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-dark border border-gray-700' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                  Cart Items ({cartData.totalItems})
                </h2>
                <div className="space-y-4">
                  {cartData.items.map((item) => (
                    <CartItem key={item.cartItemId} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`rounded-lg shadow-md p-6 sticky top-24 ${darkMode ? 'bg-dark border border-gray-700' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                  Order Summary
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Items ({cartData.totalItems}):</span>
                    <span>${cartData.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Shipping:</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  
                  <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Tax:</span>
                    <span>${(cartData.totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <hr className={`${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                  
                  <div className={`flex justify-between text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    <span>Total:</span>
                    <span>${(cartData.totalPrice * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-accent text-white py-3 px-4 rounded-md font-medium transition-colors mb-4">
                  Proceed to Checkout
                </button>
                
                <Link 
                  to="/products" 
                  className={`block text-center py-2 px-4 rounded-md border transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}