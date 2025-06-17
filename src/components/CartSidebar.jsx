import React, { useState } from "react";
import "../styles/CartSidebar.css";

const CartSidebar = ({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
}) => {
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Group items by id
  const grouped = cart.reduce((acc, item) => {
    acc[item.id] = acc[item.id] || { ...item, quantity: 0 };
    acc[item.id].quantity++;
    return acc;
  }, {});

  const items = Object.values(grouped);

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Apply discount if valid
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

  // Calculate total after discount
  const total = appliedDiscount ? subtotal - appliedDiscount.amount : subtotal;

  // Calculate how much more to spend for free shipping
  const freeShippingThreshold = 1500;
  const amountForFreeShipping =
    freeShippingThreshold - total > 0 ? freeShippingThreshold - total : 0;

  // Calculate shipping progress percentage
  const shippingProgressPercentage = Math.min(
    (total / freeShippingThreshold) * 100,
    100
  );

  return (
    <div
      className={`cart-sidebar-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-sidebar-header">
          <h2>CART</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items-container">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p className="item-price">₹{item.price}</p>
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => onDecreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => onIncreaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button className="remove-item-btn" onClick={() => onRemoveFromCart(item.id)}>
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-sidebar-footer">
              {/* Special Instructions */}
              <div className="special-instructions">
                {showInstructions ? (
                  <>
                    <textarea
                      placeholder="Add any special instructions/notes"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="instructions-textarea"
                    />
                    <div className="instructions-buttons">
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setSpecialInstructions("");
                          setShowInstructions(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="add-note-btn"
                        onClick={() => setShowInstructions(false)}
                      >
                        Add Note
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="instructions-btn"
                    onClick={() => setShowInstructions(true)}
                  >
                    Add any special instructions/notes
                  </button>
                )}
              </div>

              {/* Discount Code */}
              <div className="cart-discount">
                <input
                  type="text"
                  placeholder="Apply Discount Code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="discount-input"
                />
                <button className="apply-btn" onClick={applyDiscount}>
                  Apply
                </button>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>INR {subtotal}</span>
                </div>
                {appliedDiscount && (
                  <div className="summary-row discount">
                    <span>Discount ({appliedDiscount.percentage}%)</span>
                    <span>-INR {appliedDiscount.amount}</span>
                  </div>
                )}
                <div className="summary-row shipping">
                  <span>Shipping</span>
                  <span>
                    {total >= freeShippingThreshold
                      ? "FREE"
                      : "FREE"}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>INR {total}</span>
                </div>
              </div>




              {/* Cart Actions */}
              <div className="cart-actions">
                <button className="checkout-btn">CHECKOUT</button>
                <button className="continue-shopping-btn" onClick={onClose}>
                  Continue Shopping
                </button>
              </div>

              {/* Payment Info */}
              <div className="cart-payment-info">
                <p>Secure checkout powered by Stripe</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
