import { Router } from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadImage } from "../utils/upload.js";
import {
  getStats,
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  verifyPayment,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImageFile,
  getCustomers,
  getCoupons,
} from "../controllers/adminController.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrder);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/payment", verifyPayment);

router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.post("/upload", uploadImage.single("image"), uploadImageFile);

router.get("/customers", getCustomers);
router.get("/coupons", getCoupons);

export default router;