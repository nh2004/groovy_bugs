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
            userId: user.id,
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress,
            image: user.imageUrl,
          });
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      };
      syncUser();
    }
  }, [isSignedIn, user]);

  return null;
};

export default ClerkSync;
