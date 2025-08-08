import productModel from '../models/productModel.js';

class ProductRepository {
  async getAll(filter = {}, options = {}) {
    return productModel.paginate(filter, options);
  }

  async getById(id) {
    return productModel.findById(id);
  }

  async create(data) {
    return productModel.create(data);
  }

  async update(id, data) {
    return productModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return productModel.findByIdAndDelete(id);
  }
}

export default ProductRepository;
