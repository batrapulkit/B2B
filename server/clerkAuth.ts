import { requireAuth, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

const SKIP_AUTH = process.env.SKIP_AUTH === "true";
export { requireAuth };

export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (SKIP_AUTH) {
      console.warn("⚠️ SKIP_AUTH enabled — skipping Clerk auth");
      return next();
    }

    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Skipping role check in development mode");
        return next();
      }

      const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      });
      const user = await response.json();

      const roles: string[] = user.public_metadata?.roles || [];
      const hasRole = allowedRoles.some((r) => roles.includes(r));
      if (!hasRole)
        return res.status(403).json({ message: "Forbidden: insufficient role" });

      next();
    } catch (err) {
      console.error("Role check failed:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
