import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import ProductsRouter from "./routes/products.route.js";
import OrderRouter from "./routes/orders.route.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/products", ProductsRouter);
app.use("/api/orders", OrderRouter);

app.use("/public/products", express.static("public/products"));

app.get("/", (req, res) => {
  res.send("Welcome to the Muhamad Rafli API");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port http://localhost:${PORT}`);
});
