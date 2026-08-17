import { getSession } from "../services/sessionService.js";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required"
    });
  }

  const token = authorization.slice(7);
  const session = getSession(token);

  if (!session) {
    return res.status(401).json({
      ok: false,
      error: "Invalid or expired session"
    });
  }

  req.auth = session;

  next();
}
