import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "payquick-api",
    network: "Arc Testnet"
  });
});

app.listen(PORT, () => {
  console.log(`PayQuick API running on port ${PORT}`);
});
