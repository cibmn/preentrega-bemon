import { Router } from "express";
import { isAuth, authRole } from '../middlewares/auth.js';
import productController from '../controllers/productController.js';

const router = Router();

// Ruta para crear un producto (solo admin puede)
router.post(
  "/",
  isAuth, 
  authRole(["admin"]), 
  productController.createProduct 
);

// Ruta para actualizar un producto (solo admin puede)
router.patch(
  "/:id",
  isAuth, 
  authRole(["admin"]), 
  productController.updateProduct 
);

// Ruta para eliminar un producto (solo admin puede)
router.delete(
  "/:id",
  isAuth, 
  authRole(["admin"]), 
  productController.deleteProduct 
);

// Ruta para listar productos (todos pueden ver)
router.get("/", productController.listProducts);

export default router;
