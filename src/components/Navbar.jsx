import React from "react";
import { Link } from "react-router-dom";
import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";
import "../styles/Navbar.css";

const Navbar = ({ cartCount, onCartClick }) => {
  const { isSignedIn } = useAuth();
  return (
    <>
      <div className="navbar-topline"></div>
      <nav className="navbar">
        <div className="navbar-left">
          <img
            src="/images/logo.jpg"
            alt="Groovy Bugs Logo"
            className="navbar-logo-img"
          />
        </div>
        <ul className="navbar-links">
          <li>
            <a href="/">HOME</a>
          </li>
          <li>
            <a href="/tees">TEES</a>
          </li>
          <li>
            <a href="/tote-bags">TOTE BAGS</a>
          </li>
          <li>
            <a href="/posters">POSTERS</a>
          </li>
          <li>
            <a href="/shop">SHOP ALL</a>
          </li>
          <li>
            <a href="/contact">CONTACT US</a>
          </li>
          <li>
            <a href="/track">TRACK ORDER</a>
          </li>
        </ul>
        <div className="navbar-icons">
          <a href="#" aria-label="Search">
            <img
              src="/images/icons/magnifying-glass.jpg"
              alt="Search Icon"
              className="navbar-icon-img"
            />
          </a>
          {isSignedIn ? (
            <div className="user-button-wrapper">
              <Link to="/profile" aria-label="Profile" className="profile-link">
                <UserButton afterSignOutUrl="/" />
              </Link>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="sign-in-button">
                <img
                  src="/images/icons/user.jpg"
                  alt="User Icon"
                  className="navbar-icon-img"
                />
              </button>
            </SignInButton>
          )}
          <button
            onClick={onCartClick}
            className="cart-button"
            aria-label="Cart"
          >
            <img
              src="/images/icons/cart.jpg"
              alt="Cart Icon"
              className="navbar-icon-img"
            />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
