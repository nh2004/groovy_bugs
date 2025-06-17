import React from "react";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import "../styles/LoginPage.css";
import "../styles/ClerkAuth.css";

const SignUp = () => {
  return (
    <div
      className="login-page"
      style={{
        background: "url('/images/bg.jpg') center center/cover no-repeat",
        minHeight: "100dvh",
        minWidth: "100vw",
        width: "100vw",
        boxSizing: "border-box",
      }}
    >
      <div className="login-box clerk-container">
        <img
          src="/images/logo.jpg"
          alt="Groovy Bugs Logo"
          className="login-logo"
        />
        <h2>Sign Up</h2>
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              formButtonPrimary: "clerk-button",
              card: "clerk-card",
              headerTitle: "clerk-title",
              headerSubtitle: "clerk-subtitle",
              socialButtonsBlockButton: "clerk-social-button",
              formFieldInput: "clerk-input",
              footer: "clerk-footer",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignUp;
