import React from "react";
import { Link } from "react-router-dom";
import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { isSignedIn } = useAuth();
  const { getCartCount, toggleCart } = useCart();

  return (
    <>
      <div className="w-full h-1 bg-main-purple fixed top-0 left-0 z-50"></div>
      <nav className="flex items-center justify-between bg-black px-10 py-3 min-h-14 sticky top-0 z-40 shadow-lg border-none">
        <div className="flex items-center">
          <img
            src="/images/logo.jpg"
            alt="Groovy Bugs Logo"
            className="h-15 w-15 object-contain mr-10"
          />
        </div>
        
        <ul className="flex flex-1 justify-center gap-9 list-none m-0 p-0">
          <li>
            <Link to="/" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              HOME
            </Link>
          </li>
          <li>
            <Link to="/tees" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              TEES
            </Link>
          </li>
          <li>
            <Link to="/tote-bags" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              TOTE BAGS
            </Link>
          </li>
          <li>
            <Link to="/posters" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              POSTERS
            </Link>
          </li>
          <li>
            <Link to="/shop" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              SHOP ALL
            </Link>
          </li>
          <li>
            <a href="/contact" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              CONTACT US
            </a>
          </li>
          <li>
            <a href="/track" className="text-white font-mono text-base font-bold uppercase tracking-wider no-underline transition-all duration-200 py-1 px-2 border-b-2 border-transparent hover:text-main-purple hover:border-main-purple">
              TRACK ORDER
            </a>
          </li>
        </ul>
        
        <div className="flex items-center gap-5 ml-10">
          <a href="#" aria-label="Search">
            <img
              src="/images/icons/magnifying-glass.jpg"
              alt="Search Icon"
              className="h-6 w-6 object-contain"
            />
          </a>
          
          {isSignedIn ? (
            <div className="flex items-center justify-center">
              <Link to="/profile" aria-label="Profile" className="flex items-center justify-center no-underline">
                <UserButton afterSignOutUrl="/" />
              </Link>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center">
                <img
                  src="/images/icons/user.jpg"
                  alt="User Icon"
                  className="h-6 w-6 object-contain"
                />
              </button>
            </SignInButton>
          )}
          
          <button
            onClick={toggleCart}
            className="bg-transparent border-none p-0 cursor-pointer relative flex items-center justify-center"
            aria-label="Cart"
          >
            <img
              src="/images/icons/cart.jpg"
              alt="Cart Icon"
              className="h-6 w-6 object-contain"
            />
            {getCartCount() > 0 && (
              <span className="bg-main-purple text-white rounded-full px-2 py-1 text-xs font-bold ml-1">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;