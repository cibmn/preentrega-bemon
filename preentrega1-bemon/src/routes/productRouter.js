import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { jwtAuth } from '../middlewares/jwtAuth.js';
import { authorizeRole } from '../middlewares/auth.js';
import { uploader } from '../utils/multerUtil.js';

const router = Router();
const productService = new productDBManager();

router.get('/', async (req, res) => {
  try {
    // Pasamos req.query para paginación, límite y orden
    const products = await productService.getAllProducts(req.query);
    res.send({ status: 'success', payload: products });
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const product = await productService.getProductByID(req.params.pid);
    res.send({ status: 'success', payload: product });
  } catch (error) {
    res.status(404).send({ status: 'error', message: error.message });
  }
});

router.post('/', jwtAuth, authorizeRole('admin'), uploader.array('thumbnails', 3), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map(file => file.path);
  }
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).send({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

router.put('/:pid', jwtAuth, authorizeRole('admin'), uploader.array('thumbnails', 3), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map(file => file.path);
  }
  try {
    const updatedProduct = await productService.updateProduct(req.params.pid, req.body);
    res.send({ status: 'success', payload: updatedProduct });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

router.delete('/:pid', jwtAuth, authorizeRole('admin'), async (req, res) => {
  try {
    await productService.deleteProduct(req.params.pid);
    res.send({ status: 'success', message: `Producto ${req.params.pid} eliminado` });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

export default router;
