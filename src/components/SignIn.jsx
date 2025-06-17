import React from "react";
import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import "../styles/LoginPage.css";
import "../styles/ClerkAuth.css";

const SignIn = () => {
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
        <h2>Sign In</h2>
        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
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

export default SignIn;
