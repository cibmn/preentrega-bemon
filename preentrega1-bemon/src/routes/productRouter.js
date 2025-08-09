import { Router } from "express";
import { isAuth, authRole } from '../middlewares/auth.js';
import productController from '../controllers/productController.js';

const router = Router();

router.post(
  "/",
  isAuth, 
  authRole(["admin"]), 
  productController.createProduct 
);

router.patch(
  "/:id",
  isAuth, 
  authRole(["admin"]), 
  productController.updateProduct 
);

router.delete(
  "/:id",
  isAuth, 
  authRole(["admin"]), 
  productController.deleteProduct 
);

router.get("/", productController.listProducts);

export default router;
