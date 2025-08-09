import mongoose from 'mongoose';  
import productModel from "../models/productModel.js";

class productDBManager {

  // Obtener todos los productos con paginación y ordenación
  async getAllProducts(params) {
    const paginate = {
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
    };

    if (params.sort && (params.sort === 'asc' || params.sort === 'desc')) paginate.sort = { price: params.sort };

    const products = await productModel.paginate({}, paginate);

    // Verificar si no hay productos
    if (!products.docs.length) {
      throw new Error('No se encontraron productos');
    }

    products.prevLink = products.hasPrevPage ? `http://localhost:8080/products?page=${products.prevPage}` : null;
    products.nextLink = products.hasNextPage ? `http://localhost:8080/products?page=${products.nextPage}` : null;

    // Add limit
    if (products.prevLink && paginate.limit !== 10) products.prevLink += `&limit=${paginate.limit}`;
    if (products.nextLink && paginate.limit !== 10) products.nextLink += `&limit=${paginate.limit}`;

    // Add sort
    if (products.prevLink && paginate.sort) products.prevLink += `&sort=${params.sort}`;
    if (products.nextLink && paginate.sort) products.nextLink += `&sort=${params.sort}`;

    return products;
  }

  async getProductByID(pid) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      throw new Error('ID de producto inválido');
    }

    const product = await productModel.findOne({ _id: pid });

    if (!product) throw new Error(`El producto ${pid} no existe!`);

    return product;
  }

  // Crear un nuevo producto
  async createProduct(product) {
    const { title, description, code, price, stock, category, thumbnails } = product;

    // Verificar que todos los campos sean válidos
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error('Error al crear el producto');
    }

    // Verificar si ya existe un producto con el mismo código
    const existingProduct = await productModel.findOne({ code });
    if (existingProduct) throw new Error('El código de producto ya existe');

    return await productModel.create({ title, description, code, price, stock, category, thumbnails });
  }

  // Actualizar un producto por su ID
  async updateProduct(pid, productUpdate) {
    const product = await this.getProductByID(pid);

    // Realizar la actualización
    return await productModel.updateOne({ _id: pid }, productUpdate);
  }

  // Eliminar un producto por su ID
  async deleteProduct(pid) {
    // Verificar si el producto existe
    const product = await this.getProductByID(pid);

    const result = await productModel.deleteOne({ _id: pid });

    // Retornar un mensaje de éxito
    return { message: `Producto con ID ${pid} eliminado exitosamente` };
  }
}

export { productDBManager };
