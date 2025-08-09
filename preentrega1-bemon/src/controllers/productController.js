import { productDBManager } from '../dao/productDBManager.js';
const ProductService = new productDBManager();

// Crear un producto
const createProduct = async (req, res) => {
  try {
    const newProduct = await ProductService.createProduct(req.body);
    res.status(201).send({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await ProductService.updateProduct(req.params.id, req.body);
    res.status(200).send({ status: 'success', payload: updatedProduct });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    res.status(200).send({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
};

// Listar productos
const listProducts = async (req, res) => {
  try {
    const products = await ProductService.getAllProducts(req.query);
    res.status(200).send({ status: 'success', payload: products });
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message });
  }
};

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts
};
