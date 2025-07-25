// ClerkSync.jsx (frontend)
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";

const ClerkSync = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        try {
          await axios.post("http://localhost:5000/api/users/clerk-sync", {
            clerkId: user.id, // CHANGED THIS FROM userId to clerkId
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress,
            image: user.imageUrl,
          });
          console.log("User synced successfully with backend."); // Add a success log
        } catch (error) {
          console.error("Error syncing user:", error.response ? error.response.data : error.message); // More detailed error log
        }
      };
      syncUser();
    }
  }, [isSignedIn, user]);

  return null;
};

export default ClerkSync;