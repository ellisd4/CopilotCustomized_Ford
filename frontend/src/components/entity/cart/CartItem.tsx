import { useState } from 'react';
import { useCart, CartItem as CartItemType } from '../../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
  index: number;
}

export default function CartItem({ item, index }: CartItemProps) {
  const { removeFromCart, loading } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(item.cartItemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const itemTotal = item.product.price * quantity;

  return (
    <tr className="border-b border-gray-700">
      {/* S. No. */}
      <td className="px-4 py-6 text-white text-center">{index}</td>
      
      {/* Product Image */}
      <td className="px-4 py-6">
        <img 
          src={`/${item.product.imgName}`} 
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.png';
          }}
        />
      </td>

      {/* Product Name */}
      <td className="px-4 py-6 text-white font-medium">
        {item.product.name}
      </td>

      {/* Unit Price */}
      <td className="px-4 py-6 text-white font-semibold">
        ${item.product.price.toFixed(0)}
      </td>

      {/* Quantity */}
      <td className="px-4 py-6">
        <div className="flex items-center justify-center">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-center focus:outline-none focus:border-green-600"
          />
        </div>
      </td>

      {/* Total */}
      <td className="px-4 py-6 text-white font-semibold">
        ${itemTotal.toFixed(0)}
      </td>

      {/* Remove */}
      <td className="px-4 py-6 text-center">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
          title="Remove item"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}