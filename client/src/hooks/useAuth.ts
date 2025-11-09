import { useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();

  console.log("Clerk Auth:", { isLoaded, isSignedIn, user });

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
  };
}
