import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { userAPI } from "../services/api";

// All possible categories as per your enum:
const ALL_CATEGORIES = ["Posters", "Tees", "Tote Bags", "Accessories"];

const GENDERS = [
  { label: "Select Gender", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" }
];

const ADDRESS_TYPES = [
  { label: "Home", value: "home" },
  { label: "Work", value: "work" },
  { label: "Other", value: "other" }
];

const CompleteProfile = ({ onClose }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Pre-fill user data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: "",
    dateOfBirth: "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    preferences: {
      favoriteCategories: [],
      newsletter: true,
      smsUpdates: false,
      emailUpdates: true
    },
    address: {
      type: "home",
      fullName: user?.fullName || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      isDefault: true
    },
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Handle changes for top-level user fields or preferences
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Nested preferences fields
    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === "checkbox" ? checked : value
        }
      }));
      setSubmitError(null);
      return;
    }
    setFormData({ ...formData, [name]: value });
    setSubmitError(null);
  };

  // Handle address field changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
    setSubmitError(null);
  };

  // Handle favorite categories (multiselect)
  const handleFavoriteCategories = (e) => {
    const options = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, favoriteCategories: options }
    }));
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    // Compose address array (at least one)
    const addresses = [{ ...formData.address }];
    try {
      await userAPI.completeProfile({
        clerkId: user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        addresses,
        preferences: formData.preferences
      });

      toast.success("Profile saved successfully!", { position: "top-center" });
      onClose();
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Network error. Please try again.";
      setSubmitError(errorMessage);
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900";
  const labelClasses = "block text-xs text-gray-500 font-mono ml-1 mb-1";
  const buttonClasses = "px-4 py-2 rounded font-semibold transition-colors duration-200";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-lg">
        <h2 className="text-xl mb-4 text-gray-800 font-mono">Complete Your Profile</h2>
        {submitError && (
          <p className="text-red-600 text-sm mb-3 text-center">{submitError}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>First Name</label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={inputClasses}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClasses}>Last Name</label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={inputClasses}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClasses}
              disabled={!!user?.primaryEmailAddress?.emailAddress} // can't change Clerk email
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={inputClasses}
                disabled={loading}
              >
                {GENDERS.map(option =>
                  <option key={option.value} value={option.value}>{option.label}</option>
                )}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className={inputClasses}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className={labelClasses}>Favorite Categories</label>
            <select
              multiple
              name="favoriteCategories"
              value={formData.preferences.favoriteCategories}
              onChange={handleFavoriteCategories}
              className={inputClasses}
              disabled={loading}
            >
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400 ml-1">(Ctrl/Cmd+Click to select multiple)</span>
          </div>

          {/* Preferences checkboxes */}
          <div className="flex gap-4 mt-2">
            <label className="flex items-center text-xs text-gray-600 font-mono">
              <input
                type="checkbox"
                name="preferences.newsletter"
                checked={formData.preferences.newsletter}
                onChange={handleChange}
                disabled={loading}
                className="mr-2"
              />
              Newsletter
            </label>
            <label className="flex items-center text-xs text-gray-600 font-mono">
              <input
                type="checkbox"
                name="preferences.smsUpdates"
                checked={formData.preferences.smsUpdates}
                onChange={handleChange}
                disabled={loading}
                className="mr-2"
              />
              SMS Updates
            </label>
            <label className="flex items-center text-xs text-gray-600 font-mono">
              <input
                type="checkbox"
                name="preferences.emailUpdates"
                checked={formData.preferences.emailUpdates}
                onChange={handleChange}
                disabled={loading}
                className="mr-2"
              />
              Email Updates
            </label>
          </div>

          {/* Address Section */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex gap-4 mb-2">
              <div>
                <label className={labelClasses}>Address Type</label>
                <select
                  name="type"
                  value={formData.address.type}
                  onChange={handleAddressChange}
                  className={inputClasses}
                  required
                  disabled={loading}
                >
                  {ADDRESS_TYPES.map(opt =>
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  value={formData.address.fullName}
                  onChange={handleAddressChange}
                  required
                  className={inputClasses}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Address Line 1</label>
              <input
                name="addressLine1"
                type="text"
                value={formData.address.addressLine1}
                onChange={handleAddressChange}
                required
                className={inputClasses}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClasses}>Address Line 2</label>
              <input
                name="addressLine2"
                type="text"
                value={formData.address.addressLine2}
                onChange={handleAddressChange}
                className={inputClasses}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>City</label>
                <input
                  name="city"
                  type="text"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  required
                  className={inputClasses}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClasses}>State</label>
                <input
                  name="state"
                  type="text"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  required
                  className={inputClasses}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Postal Code</label>
                <input
                  name="postalCode"
                  type="text"
                  value={formData.address.postalCode}
                  onChange={handleAddressChange}
                  required
                  className={inputClasses}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClasses}>Country</label>
                <input
                  name="country"
                  type="text"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  required
                  className={inputClasses}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input
                name="phone"
                type="text"
                value={formData.address.phone}
                onChange={handleAddressChange}
                required
                className={inputClasses}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${buttonClasses} bg-blue-600 text-white hover:bg-blue-700`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;