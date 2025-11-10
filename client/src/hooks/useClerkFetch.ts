import { useAuth } from "@clerk/clerk-react";

/**
 * A small helper hook to make authenticated API requests
 * It automatically attaches the Clerk token from the current session.
 */
export function useClerkFetch() {
  const { getToken, isLoaded } = useAuth();

  async function clerkFetch(url: string, options: RequestInit = {}) {
    if (!isLoaded) throw new Error("Clerk not loaded yet");

    const token = await getToken();
    if (!token) throw new Error("No Clerk token available");

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("❌ ClerkFetch Error:", res.status, url, text);
      throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
    }

    if (res.status === 204) return null;

    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  return { clerkFetch };
}
