import { Router } from "express";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({
    authenticated: false
  });
});

export default router;
