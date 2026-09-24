import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  submitPayment,
  trackOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/track", trackOrder);
router.post("/", protect, placeOrder);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.post("/:id/payment", protect, submitPayment);

export default router;