import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrders,
  getShowOrder,
  updateOrder,
} from "../controllers/orders.controller.js";
const router = Router();

router.get("/", getOrders);
router.post("/create", createOrder);
router.get("/show/:id", getShowOrder);
router.put("/update/:id", updateOrder);
router.delete("/delete/:id", deleteOrder);

export default router;
