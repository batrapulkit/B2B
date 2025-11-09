import { useAuth } from "@clerk/clerk-react";

export function useClerkFetch() {
  const { getToken } = useAuth();

  async function clerkFetch(url: string, options: RequestInit = {}) {
    const token = await getToken({ template: "default" });

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  return { clerkFetch };
}
