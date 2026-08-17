import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import invoicesRouter from "./routes/invoices.js";
import checkoutRouter from "./routes/checkout.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/checkout", checkoutRouter);

app.listen(PORT, () => {
  console.log(`PayQuick API running on port ${PORT}`);
});
