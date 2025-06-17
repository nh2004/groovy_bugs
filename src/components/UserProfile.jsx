import React from "react";
import { useUser } from "@clerk/clerk-react";
import "../styles/LoginPage.css";
import "../styles/ClerkAuth.css";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

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
        <h2>My Profile</h2>

        <div className="user-profile">
          <div className="user-profile-header">
            <img
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="user-profile-image"
            />
            <h3>{user.fullName || "Welcome!"}</h3>
            <p>{user.primaryEmailAddress?.emailAddress}</p>
          </div>

          <div className="user-profile-section">
            <h4>Account Information</h4>
            <div className="user-profile-info">
              <p>
                <strong>User ID:</strong> {user.id}
              </p>
              <p>
                <strong>Username:</strong> {user.username || "Not set"}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="user-profile-section">
            <h4>Preferences</h4>
            <div className="user-profile-info">
              <p>Manage your account settings and preferences</p>
              <button
                className="clerk-button"
                onClick={() => (window.location.href = "/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
