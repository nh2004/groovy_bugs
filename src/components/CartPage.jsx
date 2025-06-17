import React from "react";
import "../styles/CartPage.css";

const CartPage = ({ cart, onRemoveFromCart }) => {
  const grouped = cart.reduce((acc, item) => {
    acc[item.id] = acc[item.id] || { ...item, quantity: 0 };
    acc[item.id].quantity++;
    return acc;
  }, {});
  const items = Object.values(grouped);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="cart-section">
      <h2 className="cart-title">Your Cart</h2>
      {items.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {items.map(item => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>₹{item.price} x {item.quantity}</p>
                <button className="remove-btn" onClick={() => onRemoveFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cart-total">Total: ₹{total}</div>
        </div>
      )}
    </section>
  );
};

export default CartPage; 