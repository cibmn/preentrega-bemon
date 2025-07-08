import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { isAuth, isAdmin } from '../middlewares/auth.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Solo usuarios autenticados pueden ver su carrito
router.get('/:cid', isAuth, async (req, res) => {
    try {
        const result = await CartService.getProductsFromCartByID(req.params.cid);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// Crear carrito: puede ser público o protegido según lógica (aquí lo dejo público)
router.post('/', async (req, res) => {
    try {
        const result = await CartService.createCart();
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// Añadir producto: debe estar autenticado
router.post('/:cid/product/:pid', isAuth, async (req, res) => {
    try {
        const result = await CartService.addProductByID(req.params.cid, req.params.pid);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// Borrar producto: autenticado y quizás admin (depende de tu política)
// Aquí lo dejo solo autenticado
router.delete('/:cid/product/:pid', isAuth, async (req, res) => {
    try {
        const result = await CartService.deleteProductByID(req.params.cid, req.params.pid);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// Actualizar todos los productos: autenticado
router.put('/:cid', isAuth, async (req, res) => {
    try {
        const result = await CartService.updateAllProducts(req.params.cid, req.body.products);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// Actualizar cantidad de producto: autenticado
router.put('/:cid/product/:pid', isAuth, async (req, res) => {
    try {
        const result = await CartService.updateProductByID(req.params.cid, req.params.pid, req.body.quantity);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

// Borrar todos los productos del carrito: autenticado
router.delete('/:cid', isAuth, async (req, res) => {
    try {
        const result = await CartService.deleteAllProducts(req.params.cid);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(400).send({ status: 'error', message: error.message });
    }
});

export default router;
