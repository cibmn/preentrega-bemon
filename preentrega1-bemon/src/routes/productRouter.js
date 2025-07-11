import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { uploader } from '../utils/multerUtil.js';
import { isAuth, isAdmin } from '../middlewares/auth.js';

const router = Router();
const ProductService = new productDBManager();

router.get('/', async (req, res) => {
    const result = await ProductService.getAllProducts(req.query);
    res.send({
        status: 'success',
        payload: result
    });
});

router.get('/:pid', async (req, res) => {
    try {
        const result = await ProductService.getProductByID(req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

// PROTEGIDO: Solo admins pueden crear productos
router.post('/', isAuth, isAdmin, uploader.array('thumbnails', 3), async (req, res) => {
    if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
            req.body.thumbnails.push(file.path);
        });
    }

    try {
        const result = await ProductService.createProduct(req.body);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

// PROTEGIDO: Solo admins pueden modificar productos
router.put('/:pid', isAuth, isAdmin, uploader.array('thumbnails', 3), async (req, res) => {
    if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
            req.body.thumbnails.push(file.filename);
        });
    }

    try {
        const result = await ProductService.updateProduct(req.params.pid, req.body);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

// PROTEGIDO: Solo admins pueden eliminar productos
router.delete('/:pid', isAuth, isAdmin, async (req, res) => {
    try {
        const result = await ProductService.deleteProduct(req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

export default router;
