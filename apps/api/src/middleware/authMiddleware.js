import { getSession } from "../services/sessionService.js";

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required"
    });
  }

  const token = authorization.slice(7);

  try {
    const session = await getSession(token);

    if (!session) {
      return res.status(401).json({
        ok: false,
        error: "Invalid or expired session"
      });
    }

    req.auth = session;

    next();
  } catch (error) {
    console.error("Session validation error:", error);

    return res.status(500).json({
      ok: false,
      error: "Unable to validate session"
    });
  }
}
