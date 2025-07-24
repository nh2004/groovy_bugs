import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'; // Import toast for better feedback
import { userAPI } from "../services/api"; // Import userAPI

const CompleteProfile = ({ onClose }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.fullName || "", // Pre-fill name if available from Clerk
        gender: "",
        dob: "",
        address: "",
        preferences: "",
    });
    const [loading, setLoading] = useState(false); // Add loading state
    const [submitError, setSubmitError] = useState(null); // Add error state for submission

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSubmitError(null); // Clear previous errors on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true
        setSubmitError(null); // Clear previous errors

        try {
            // Format DOB to ISO string (YYYY-MM-DD) for backend consistency
            const formattedDob = formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : "";

            // Call the userAPI.completeProfile function
            // It will handle the POST request, headers, and body JSON.stringify internally
            const responseData = await userAPI.completeProfile({
                clerkId: user.id,
                ...formData,
                dob: formattedDob, // Use formatted DOB
            });

            // If the API call was successful (userAPI method handles res.ok check and throws error otherwise)
            // Or if you want to check the response structure, you can do so here:
            // if (responseData) { // Example check if responseData is expected
                toast.success("Profile saved successfully!", { position: "top-center" });
                onClose(); // Close the modal
                navigate("/"); // Redirect to home or another page
            // } else {
            //    throw new Error("Unexpected response from server.");
            // }

        } catch (error) {
            console.error("Failed to save profile:", error);
            // Check if it's an Axios error with a response message
            const errorMessage = error.response?.data?.message || error.message || "Network error or unexpected issue. Please try again.";
            setSubmitError(errorMessage);
            toast.error(errorMessage, { position: "top-center" });
        } finally {
            setLoading(false); // Set loading to false regardless of success or failure
        }
    };

    // Basic styling for inputs - you might want to move this to a CSS file or Tailwind config
    const inputClasses = "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900";
    const buttonClasses = "px-4 py-2 rounded font-semibold transition-colors duration-200";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
                <h2 className="text-xl mb-4 text-gray-800 font-mono">Complete Your Profile</h2>
                {submitError && (
                    <p className="text-red-600 text-sm mb-3 text-center">{submitError}</p>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4"> {/* Increased gap */}
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        disabled={loading} // Disable inputs during loading
                    />
                    <input
                        name="gender"
                        type="text"
                        placeholder="Gender (e.g., Male, Female, Other)"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        disabled={loading}
                    />
                    <input
                        name="dob"
                        type="date"
                        placeholder="Date of Birth"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        disabled={loading}
                    />
                    <input
                        name="address"
                        type="text"
                        placeholder="Full Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                        disabled={loading}
                    />
                    <textarea
                        name="preferences"
                        placeholder="Preferences (e.g., Tees, Posters, minimalist, vintage - comma-separated)"
                        value={formData.preferences}
                        onChange={handleChange}
                        required
                        rows="3" // Give textarea some height
                        className={`${inputClasses} resize-y`} // Allow vertical resize
                        disabled={loading}
                    />
                    <div className="flex justify-end gap-3 mt-4"> {/* Increased gap and margin top */}
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${buttonClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}
                            disabled={loading} // Disable cancel button during loading
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`${buttonClasses} bg-blue-600 text-white hover:bg-blue-700`}
                            disabled={loading} // Disable save button during loading
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