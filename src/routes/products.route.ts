import { Router } from "express";
import {
  createProduct,
  getShowProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
import { upload } from "../libs/multer/multer.js";

const router = Router();

router.get("/", getProducts);
router.post("/create", upload.single("image"), createProduct);
router.get("/show/:id", getShowProduct);
router.put("/update/:id", upload.single("image"), updateProduct);
router.delete("/delete/:id", deleteProduct);

export default router;
