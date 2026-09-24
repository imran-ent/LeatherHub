import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  mergeCart,
} from "../controllers/cartController.js";

const router = Router();

router.use(protect);

router.get("/", getMyCart);
router.post("/items", addItem);
router.put("/items/:productId", updateQuantity);
router.delete("/items/:productId", removeItem);
router.post("/merge", mergeCart);
router.delete("/", clearCart);

export default router;