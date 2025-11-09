import { requireAuth, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

// ✅ Re-export Clerk's middleware
export { requireAuth };

/**
 * Role guard with safe fallback for development
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user from Clerk:", await response.text());
        return res.status(500).json({ message: "Clerk API error" });
      }

      const user = await response.json();

      // ✅ Fix: Default to "agent" if no role assigned yet
      const roles: string[] = user.public_metadata?.roles?.length
        ? user.public_metadata.roles
        : ["agent"];

      const hasRole = allowedRoles.some((r) => roles.includes(r));

      if (!hasRole)
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient role", roles });

      next();
    } catch (err) {
      console.error("Role check failed:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
