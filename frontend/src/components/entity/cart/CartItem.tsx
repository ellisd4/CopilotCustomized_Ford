import { useState } from 'react';
import { useCart, CartItem as CartItemType } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeFromCart, loading } = useCart();
  const { darkMode } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateCartItem(item.cartItemId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this item from your cart?')) {
      try {
        await removeFromCart(item.cartItemId);
      } catch (err) {
        console.error('Failed to remove item:', err);
      }
    }
  };

  const itemTotal = item.product.price * item.quantity;

  return (
    <div className={`flex items-center space-x-4 p-4 border-b last:border-b-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img 
          src={`/${item.product.imgName}`} 
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.png';
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className={`font-semibold text-lg ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          {item.product.name}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {item.product.description}
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          SKU: {item.product.sku}
        </p>
        <p className={`font-medium text-lg ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          ${item.product.price.toFixed(2)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={loading || isUpdating || item.quantity <= 1}
          className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
          }`}
        >
          −
        </button>
        
        <span className={`w-12 text-center font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          {isUpdating ? '...' : item.quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={loading || isUpdating}
          className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
          }`}
        >
          +
        </button>
      </div>

      {/* Item Total */}
      <div className="flex flex-col items-end space-y-2">
        <p className={`font-semibold text-lg ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          ${itemTotal.toFixed(2)}
        </p>
        
        <button
          onClick={handleRemove}
          disabled={loading}
          className={`text-sm px-3 py-1 rounded-md border transition-colors ${
            darkMode 
              ? 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50' 
              : 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white disabled:opacity-50'
          }`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}