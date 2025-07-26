import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';
import { cartAPI } from "../services/api";
import emailjs from '@emailjs/browser';
import { useUser } from "@clerk/clerk-react";
import { orderAPI } from "../services/api"; // <-- Import your orderAPI module!
const CartSidebar = ({ isOpen, onClose }) => {
    const { isSignedIn, userId } = useAuth();
    const {
        removeFromCart,
        updateQuantity,
        getGroupedCart,
        getCartTotal,
    } = useCart();

    // State for special instructions
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [showInstructions, setShowInstructions] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [orderError, setOrderError] = useState('');
    // State for discount code
    const [discountCodeInput, setDiscountCodeInput] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    //keys for email sending 
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // State for shipping address
    const [shippingAddressForm, setShippingAddressForm] = useState({
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        landmark: ""
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isAddressSaved, setIsAddressSaved] = useState(false);

    const groupedItems = getGroupedCart();
    const subtotal = getCartTotal();
    const total = appliedDiscount ? subtotal - appliedDiscount.amount : subtotal;

    /**
     * Effect to check if an address is already populated.
     * In a real app, you might fetch a user's default address here.
     */
    useEffect(() => {
        const addressComplete =
            shippingAddressForm.street &&
            shippingAddressForm.city &&
            shippingAddressForm.state &&
            shippingAddressForm.postalCode;
        setIsAddressSaved(addressComplete);
    }, [shippingAddressForm]);

    /**
     * Handles applying a discount code.
     */
    const handleApplyDiscount = () => {
        let discountAmount = 0;
        let percentage = 0;
        let message = "";

        if (discountCodeInput.toLowerCase() === "groovy20") {
            percentage = 20;
            discountAmount = subtotal * 0.2;
            message = "Discount 'GROOVY20' applied!";
        } else if (discountCodeInput.toLowerCase() === "welcome10") {
            percentage = 10;
            discountAmount = subtotal * 0.1;
            message = "Discount 'WELCOME10' applied!";
        } else {
            setAppliedDiscount(null);
            toast.error("Invalid discount code", { theme: "dark" });
            setDiscountCodeInput("");
            return;
        }

        setAppliedDiscount({
            code: discountCodeInput,
            percentage: percentage,
            amount: discountAmount,
        });
        toast.success(message, { theme: "dark" });
        setDiscountCodeInput("");
    };

    /**
     * Updates the shipping address form state on input change.
     */
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddressForm(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handles saving the shipping address.
     */
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (!shippingAddressForm.street || !shippingAddressForm.city || !shippingAddressForm.state || !shippingAddressForm.postalCode) {
            toast.error("Please fill in all required address fields.", { theme: "dark" });
            return;
        }
        try {
            const response = await cartAPI.updateCartDetails(userId, { shippingAddress: shippingAddressForm });
            if (response.success) {
                toast.success("Address saved successfully!", { theme: "dark" });
                setIsAddressSaved(true);
                setShowAddressForm(false);   // ONLY CLOSE FORM HERE!
            } else {
                toast.error(response.message || "Failed to save address.", { theme: "dark" });
            }
        } catch (error) {
            // console.error("Error saving address:", error); // Removed console.error
            toast.error("An error occurred while saving the address.", { theme: "dark" });
        }
    };

    /**
     * Handles the checkout process.
     */
    const { user } = useUser();

    const handleCheckout = async () => {
        setOrderError('');
        setEmailSuccess(false);

        if (!isAddressSaved) {
            toast.error("Please add and save your shipping address before checking out.", { theme: "dark" });
            return;
        }
        if (groupedItems.length === 0) {
            toast.error("Your cart is empty. Add items before checking out.", { theme: "dark" });
            return;
        }

        // Clerk user info
        const userName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown";
        const userEmail = user?.primaryEmailAddress?.emailAddress || user?.email || "";
        const userPhone = user?.phoneNumbers && user.phoneNumbers.length > 0 ? user.phoneNumbers[0]?.phoneNumber : "";

        // Prepare order items for API
        const orderItems = groupedItems.map(item => ({
            product: item.product,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            size: item.size,
            customization: item.customization,
            price: item.price,
            // API will handle totalPrice
        }));

        // Shipping address shape for order API — mapping from your form
        const shippingAddress = {
            fullName: userName,
            addressLine1: shippingAddressForm.street || shippingAddressForm.addressLine1 || "",
            addressLine2: shippingAddressForm.apartment || shippingAddressForm.addressLine2 || "",
            city: shippingAddressForm.city,
            state: shippingAddressForm.state,
            postalCode: shippingAddressForm.postalCode,
            country: shippingAddressForm.country,
            phone: userPhone || shippingAddressForm.phone || "",
        };

        // Payment integration: here, you can collect a 'paymentMethod' (for now, set to 'cod' or whatever matches your allowed enums)
        const paymentMethod = "cod";
        const paymentId = ""; // or stripe/razorpay ID if paid

        // Assemble final order data
        const orderData = {
            userId: user.id,
            userEmail,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentId, // empty/not used for COD
            specialInstructions,
            // Feel free to attach more fields: billingAddress, etc.
        };

        try {
            // 1. Create Order in the DB
            const response = await orderAPI.create(orderData);
            if (!response.order) throw new Error("Order not created. Please try again.");

            // 2. EmailJS notification
            const itemsText = orderItems
                .map(item => `${item.name} (Size: ${item.size || '-'}): ${item.quantity} x ₹${item.price.toFixed(2)}`)
                .join('\n');
            const addressText = [
                shippingAddress.addressLine1,
                shippingAddress.addressLine2,
                shippingAddress.city,
                shippingAddress.state,
                shippingAddress.postalCode,
                shippingAddress.country
            ].filter(Boolean).join(", ");

            const emailVars = {
                user_name: userName,
                user_email: userEmail,
                user_phone: userPhone,
                shipping_address: addressText,
                items: itemsText,
                order_total: total.toFixed(2),
                order_number: response.order.orderNumber, // use order from API response!
                special_instructions: specialInstructions || '(none)',
            };

            await emailjs.send(
                serviceId,
                templateId,
                emailVars,
                publicKey
            );
            setEmailSuccess(true);
            toast.success("Thank you for your order! An email confirmation has been sent.", { position: "top-center" });
        } catch (err) {
            setOrderError(err.message || "There was a problem during checkout.");
            toast.error(err.message || "Checkout failed!", { position: "top-center" });
        }
    };
    const handleCustomisation = async () => {
        if (!specialInstructions.trim()) {
            toast.error("Please enter some instructions, or cancel.", { theme: "dark" });
            return;
        }

        try {
            const response = await cartAPI.updateCartDetails(userId, { specialInstructions: specialInstructions });

            if (response.success) {
                toast.success("Instructions added successfully!", { theme: "dark" });
                setShowInstructions(false);
            } else {
                toast.error(response.message || "Failed to add instructions.", { theme: "dark" });
            }
        } catch (error) {
            // console.error("Error adding special instructions:", error); // Removed console.error
            toast.error("An error occurred while adding instructions.", { theme: "dark" });
        }
    };

    // Shared class for form inputs for consistency
    const formInputClass = "w-full bg-gray-800 border border-gray-600 rounded text-white p-2 text-sm font-mono placeholder-gray-400 focus:border-main-purple focus:outline-none";
    const formLabelClass = "block text-sm font-medium text-gray-300 mb-1 font-mono";

    return (
        <div
            className={`fixed inset-0 w-screen h-screen bg-black bg-opacity-70 z-50 flex justify-end transition-all duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-md h-screen bg-main-bg shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
                    <h2 className="m-0 text-2xl font-black text-white text-center font-mono flex-grow">CART</h2>
                    <button
                        className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 leading-none hover:text-main-purple transition-colors"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* Conditional Rendering: Empty Cart or Cart Content */}
                {groupedItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-white text-center text-lg p-6">Your cart is empty.</p>
                    </div>
                ) : (
                    <>
                        {/* Cart Items List - uses flex-1 to occupy available space and scrolls internally */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {groupedItems.map((item) => (
                                <div className="flex py-4 border-b border-gray-700 gap-4" key={`${item.product}-${item.size || 'default'}`}>
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                                    <div className="flex-1 flex flex-col">
                                        <h4 className="m-0 mb-2 text-base text-white font-mono">{item.name}</h4>
                                        <p className="m-0 mb-2 text-sm text-gray-300">₹{item.price.toFixed(2)}</p>
                                        {item.size && (<p className="m-0 mb-2 text-xs text-gray-400">Size: {item.size}</p>)}
                                        <div className="flex items-center mt-2">
                                            <button className="bg-main-purple text-white border-none rounded-l-lg w-8 h-8 text-lg flex justify-center items-center cursor-pointer hover:bg-purple-600 disabled:opacity-50" onClick={() => updateQuantity(item.product, item.size, -1)} disabled={item.quantity <= 1}>-</button>
                                            <span className="text-white text-base font-bold min-w-8 text-center bg-gray-800 h-8 flex justify-center items-center">{item.quantity}</span>
                                            <button className="bg-main-purple text-white border-none rounded-r-lg w-8 h-8 text-lg flex justify-center items-center cursor-pointer hover:bg-purple-600" onClick={() => updateQuantity(item.product, item.size, 1)}>+</button>
                                        </div>
                                        <button className="bg-transparent text-red-400 border border-red-400 py-2 px-3 rounded cursor-pointer text-xs mt-3 self-start transition-all hover:bg-red-400 hover:text-white font-mono" onClick={() => removeFromCart(item.product, item.size)}>Remove</button>
                                    </div>
                                    <div className="text-right text-white font-mono text-base font-bold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Footer Section (scrollable content) */}
                        <div className="p-4 border-t border-gray-700 flex-shrink-0 overflow-y-auto">
                            {/* Special Instructions */}
                            <div className="mb-4">
                                {showInstructions ? (
                                    <>
                                        <textarea
                                            placeholder="Add any special instructions..."
                                            value={specialInstructions}
                                            onChange={(e) => setSpecialInstructions(e.target.value)}
                                            className={`${formInputClass} h-20 resize-none`}
                                        />
                                        <div className="flex justify-end gap-2.5 mt-2.5">
                                            <button className="py-2 px-4 rounded cursor-pointer font-bold transition-all bg-transparent text-white border border-gray-600 hover:bg-gray-700 font-mono text-sm" onClick={() => { setSpecialInstructions(""); setShowInstructions(false); }}>Cancel</button>
                                            <button className="py-2 px-4 rounded cursor-pointer font-bold transition-all bg-main-purple text-white border border-main-purple hover:bg-purple-700 font-mono text-sm" onClick={() => {
                                                setShowInstructions(false); // Only close form here
                                                handleCustomisation();
                                            }}>Add Note</button>
                                        </div>
                                    </>
                                ) : (
                                    <button className="text-sm inline-block bg-transparent border border-main-purple text-main-purple py-2 px-4 rounded cursor-pointer hover:bg-main-purple hover:text-white transition-all font-mono" onClick={() => setShowInstructions(true)}>Add Customization</button>
                                )}
                            </div>

                            {/* Discount Code */}
                            {/* This section was commented out in your original code, keeping it commented */}
                            {/*
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Apply Discount Code" value={discountCodeInput} onChange={(e) => setDiscountCodeInput(e.target.value)} className={`${formInputClass} p-3`} />
                                    <button className="bg-main-purple text-white border-none rounded px-4 text-sm cursor-pointer hover:bg-purple-600 transition-colors font-mono font-bold" onClick={handleApplyDiscount}>Apply</button>
                                </div>
                                {appliedDiscount && <p className="mt-2 text-sm text-accent-pink font-mono">Discount '{appliedDiscount.code}' applied ({appliedDiscount.percentage}% off)!</p>}
                            </div>
                            */}

                            {/* Shipping Address */}
                            <div className="mb-4 border-t border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-bold text-white font-mono m-0">Shipping Address</h3>
                                    {isAddressSaved && !showAddressForm && (
                                        <button onClick={() => setShowAddressForm(true)} className="text-sm text-main-purple hover:text-purple-400 font-mono transition-colors bg-transparent border-none cursor-pointer">Edit</button>
                                    )}
                                </div>
                                {showAddressForm ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-3">
                                        <div>
                                            <label htmlFor="street" className={formLabelClass}>Street Address <span className="text-red-500">*</span></label>
                                            <input type="text" id="street" name="street" value={shippingAddressForm.street} onChange={handleAddressChange} className={formInputClass} required />
                                        </div>
                                        <div>
                                            <label htmlFor="apartment" className={formLabelClass}>Apartment, Suite, etc. (Optional)</label>
                                            <input type="text" id="apartment" name="apartment" value={shippingAddressForm.apartment} onChange={handleAddressChange} className={formInputClass} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="city" className={formLabelClass}>City <span className="text-red-500">*</span></label>
                                                <input type="text" id="city" name="city" value={shippingAddressForm.city} onChange={handleAddressChange} className={formInputClass} required />
                                            </div>
                                            <div>
                                                <label htmlFor="state" className={formLabelClass}>State <span className="text-red-500">*</span></label>
                                                <input type="text" id="state" name="state" value={shippingAddressForm.state} onChange={handleAddressChange} className={formInputClass} required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="postalCode" className={formLabelClass}>Postal Code <span className="text-red-500">*</span></label>
                                                <input type="text" id="postalCode" name="postalCode" value={shippingAddressForm.postalCode} onChange={handleAddressChange} className={formInputClass} required />
                                            </div>
                                            <div>
                                                <label htmlFor="country" className={formLabelClass}>Country <span className="text-red-500">*</span></label>
                                                <input type="text" id="country" name="country" value={shippingAddressForm.country} onChange={handleAddressChange} className={formInputClass} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="landmark" className={formLabelClass}>Landmark (Optional)</label>
                                            <input type="text" id="landmark" name="landmark" value={shippingAddressForm.landmark} onChange={handleAddressChange} className={formInputClass} />
                                        </div>
                                        <div className="flex justify-end gap-2.5 pt-2">
                                            <button type="button" className="py-2 px-4 rounded cursor-pointer font-bold transition-all bg-transparent text-white border border-gray-600 hover:bg-gray-700 font-mono text-sm" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                            <button type="submit" className="py-2 px-4 rounded cursor-pointer font-bold transition-all bg-main-purple text-white border border-main-purple hover:bg-purple-700 font-mono text-sm">Save Address</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {isAddressSaved ? (
                                            <div className="text-gray-300 text-sm font-mono space-y-1">
                                                <p>{shippingAddressForm.street}{shippingAddressForm.apartment && `, ${shippingAddressForm.apartment}`}</p>
                                                <p>{shippingAddressForm.city}, {shippingAddressForm.state} - {shippingAddressForm.postalCode}</p>
                                                <p>{shippingAddressForm.country}</p>
                                                {shippingAddressForm.landmark && <p className="text-gray-400">Landmark: {shippingAddressForm.landmark}</p>}
                                            </div>
                                        ) : (
                                            <button className="text-sm inline-block bg-transparent border border-main-purple text-main-purple py-2 px-4 rounded cursor-pointer hover:bg-main-purple hover:text-white transition-all font-mono" onClick={() => setShowAddressForm(true)}>Add Shipping Address</button>
                                        )}
                                    </>
                                )}
                            </div>
                            {/* Email Confirmation Message */}
                            {emailSuccess && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-900 px-4 py-2 rounded text-center font-mono">
                                    <strong>Thanks for your order with Groovy Bugs!</strong><br />
                                    We've received your order. An email confirmation is on the way.<br />
                                    Our team will process your order soon. <br classesName="hidden sm:block" />
                                    You’ll receive updates by email. Thanks for being a valued Groovy Bugs customer!
                                </div>
                            )}
                            {orderError && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-900 px-4 py-2 rounded text-center font-mono">
                                    {orderError}
                                </div>
                            )}

                            {/* Cart Summary Totals */}
                            <div className="mb-4 space-y-3">
                                <div className="flex justify-between text-sm text-gray-300 font-mono">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex justify-between text-sm text-accent-pink font-mono">
                                        <span>Discount ({appliedDiscount.percentage}%)</span>
                                        <span>-₹{appliedDiscount.amount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-300 font-mono">
                                    <span>Shipping</span>
                                    <span>Can Vary</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-3 mt-2 font-mono">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Cart Actions */}
                            <div className="flex flex-col gap-3 mb-4">
                                <button
                                    className={`text-white border-none rounded-lg py-3 text-base font-bold cursor-pointer text-center transition-colors font-mono tracking-wider ${isAddressSaved && groupedItems.length > 0
                                        ? "bg-main-purple hover:bg-purple-600"
                                        : "bg-gray-600 cursor-not-allowed opacity-60"
                                        }`}
                                    onClick={handleCheckout}
                                    disabled={!isAddressSaved || groupedItems.length === 0}
                                >
                                    CHECKOUT
                                </button>
                                <Link
                                    to="/shop"
                                    onClick={onClose}
                                    className="bg-transparent text-white border border-main-purple rounded-lg py-3 text-sm cursor-pointer text-center hover:bg-main-purple hover:text-white transition-all font-mono tracking-wider no-underline"
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            {/* Payment Info Footer */}
                            <div className="text-center">
                                <p className="m-0 text-xs text-gray-400 font-mono">
                                    Orders Will be confirmed via email and payment will be processed securely.
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
