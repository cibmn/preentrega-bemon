import ProductRepository from '../repositories/productRepository.js';

class ProductService {
  constructor() {
    this.productRepo = new ProductRepository();
  }

  async getAllProducts(query) {
    // Aquí podrías parsear query params (paginación, filtros, orden)
    const filter = {};
    const options = {
      page: query.page || 1,
      limit: query.limit || 10,
      sort: query.sort || {}
    };

    return this.productRepo.getAll(filter, options);
  }

  async getProductByID(id) {
    const product = await this.productRepo.getById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async createProduct(data) {
    return this.productRepo.create(data);
  }

  async updateProduct(id, data) {
    const updated = await this.productRepo.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar el producto');
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await this.productRepo.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar el producto');
    return deleted;
  }
}

export default ProductService;
