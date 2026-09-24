import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/userController.js";

const router = Router();

router.use(protect);

router.put("/profile", updateProfile);
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

export default router;