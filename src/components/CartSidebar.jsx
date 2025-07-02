import React, { useState } from "react";
import { useCart } from "../context/CartContext";

const CartSidebar = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    getGroupedCart, 
    getCartTotal 
  } = useCart();
  
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const groupedItems = getGroupedCart();
  const subtotal = getCartTotal();

  const applyDiscount = () => {
    if (discountCode.toLowerCase() === "groovy20") {
      setAppliedDiscount({
        code: discountCode,
        percentage: 20,
        amount: subtotal * 0.2,
      });
    } else if (discountCode.toLowerCase() === "welcome10") {
      setAppliedDiscount({
        code: discountCode,
        percentage: 10,
        amount: subtotal * 0.1,
      });
    } else {
      alert("Invalid discount code");
      setAppliedDiscount(null);
    }
    setDiscountCode("");
  };

  const total = appliedDiscount ? subtotal - appliedDiscount.amount : subtotal;

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 z-50 flex justify-end transition-all duration-300 ${
        isCartOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className={`w-full max-w-md h-screen bg-main-bg shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="m-0 text-2xl font-black text-white text-center font-mono flex-grow">
            CART
          </h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 leading-none hover:text-main-purple transition-colors duration-200"
            onClick={() => setIsCartOpen(false)}
          >
            ×
          </button>
        </div>

        {groupedItems.length === 0 ? (
          <p className="text-white text-center text-lg p-6">Your cart is empty.</p>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {groupedItems.map((item) => (
                <div className="flex py-4 border-b border-gray-700 bg-transparent rounded-none gap-4" key={`${item._id || item.id}-${item.size || 'default'}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-transparent flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col">
                    <h4 className="m-0 mb-2 text-base text-white font-mono">{item.name}</h4>
                    <p className="m-0 mb-2 text-sm text-gray-300">₹{item.price}</p>
                    {item.size && (
                      <p className="m-0 mb-2 text-xs text-gray-400">Size: {item.size}</p>
                    )}
                    <div className="flex items-center justify-center gap-0 mt-2 rounded-lg overflow-hidden">
                      <button
                        className="bg-main-purple text-white border-none rounded-l-lg w-8 h-8 text-lg flex justify-center items-center cursor-pointer transition-colors duration-200 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => updateQuantity(item.items[0].cartId, -1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="text-white text-base font-bold min-w-8 text-center bg-gray-800 h-8 flex justify-center items-center border-t border-b border-gray-600">
                        {item.quantity}
                      </span>
                      <button
                        className="bg-main-purple text-white border-none rounded-r-lg w-8 h-8 text-lg flex justify-center items-center cursor-pointer transition-colors duration-200 hover:bg-purple-600"
                        onClick={() => updateQuantity(item.items[0].cartId, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="bg-transparent text-white border border-gray-600 py-2 px-3 rounded cursor-pointer text-sm mt-3 self-center transition-all duration-200 hover:bg-gray-700 hover:border-gray-500 font-mono"
                      onClick={() => removeFromCart(item.items[0].cartId)}
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="p-4 border-t border-gray-700">
              {/* Special Instructions */}
              <div className="mb-6">
                {showInstructions ? (
                  <>
                    <textarea
                      placeholder="Add any special instructions/notes"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full h-20 bg-gray-800 border border-gray-600 rounded text-white p-2 text-sm resize-none mt-2 font-mono placeholder-gray-400 focus:border-main-purple focus:outline-none"
                    />
                    <div className="flex justify-end gap-2.5 mt-2.5">
                      <button
                        className="py-2 px-4 rounded cursor-pointer font-bold transition-all duration-200 ease-in-out bg-transparent text-white border border-gray-600 hover:bg-gray-700 font-mono text-sm"
                        onClick={() => {
                          setSpecialInstructions("");
                          setShowInstructions(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="py-2 px-4 rounded cursor-pointer font-bold transition-all duration-200 ease-in-out bg-main-purple text-white border border-main-purple hover:bg-purple-700 hover:border-purple-700 font-mono text-sm"
                        onClick={() => setShowInstructions(false)}
                      >
                        Add Note
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="mt-2 text-sm inline-block bg-transparent border border-main-purple text-main-purple py-2 px-4 rounded cursor-pointer hover:bg-main-purple hover:text-white transition-all duration-200 font-mono"
                    onClick={() => setShowInstructions(true)}
                  >
                    Add special instructions/notes
                  </button>
                )}
              </div>

              {/* Discount Code */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Apply Discount Code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded text-white p-3 text-sm font-mono placeholder-gray-400 focus:border-main-purple focus:outline-none"
                />
                <button 
                  className="bg-main-purple text-white border-none rounded px-4 text-sm cursor-pointer hover:bg-purple-600 transition-colors duration-200 font-mono font-bold"
                  onClick={applyDiscount}
                >
                  Apply
                </button>
              </div>

              {/* Cart Summary */}
              <div className="mb-6">
                <div className="flex justify-between mb-3 text-sm text-gray-300 font-mono">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between mb-3 text-sm text-accent-pink font-mono">
                    <span>Discount ({appliedDiscount.percentage}%)</span>
                    <span>-₹{appliedDiscount.amount}</span>
                  </div>
                )}
                <div className="flex justify-between mb-3 text-sm text-gray-300 font-mono">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-3 mt-2 font-mono">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Cart Actions */}
              <div className="flex flex-col gap-4 mb-6">
                <button className="bg-main-purple text-white border-none rounded-2xl py-3 text-base font-bold cursor-pointer text-center hover:bg-purple-600 transition-colors duration-200 font-mono tracking-wider">
                  CHECKOUT
                </button>
                <button 
                  className="bg-transparent text-white border border-main-purple rounded-2xl py-3 text-sm cursor-pointer text-center hover:bg-main-purple hover:text-white transition-all duration-200 font-mono tracking-wider"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </button>
              </div>

              {/* Payment Info */}
              <div className="text-center">
                <p className="m-0 mb-3 text-xs text-gray-400 font-mono">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;