import { Router } from 'express';
import ProductService from '../services/productService.js';
import { uploader } from '../utils/multerUtil.js';
import { isAuth, isAdmin } from '../middlewares/auth.js';

const router = Router();
const productService = new ProductService();

router.get('/', async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.send({ status: 'success', payload: result });
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

router.post('/', isAuth, isAdmin, uploader.array('thumbnails', 3), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map(file => file.path);
  }
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).send({ status: 'success', payload: product });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

router.put('/:pid', isAuth, isAdmin, uploader.array('thumbnails', 3), async (req, res) => {
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

router.delete('/:pid', isAuth, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await productService.deleteProduct(req.params.pid);
    res.send({ status: 'success', payload: deletedProduct });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
});

export default router;
