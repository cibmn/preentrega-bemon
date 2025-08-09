import mongoose from "mongoose";
import productModel from "../models/productModel.js";

class productDBManager {
  async getAllProducts(params) {
    const paginate = {
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
    };

    if (params.sort && (params.sort === "asc" || params.sort === "desc"))
      paginate.sort = { price: params.sort };

    const products = await productModel.paginate({}, paginate);

    if (!products.docs.length) {
      throw new Error("No se encontraron productos");
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000"; 
    products.prevLink = products.hasPrevPage
      ? `${baseUrl}/products?page=${products.prevPage}`
      : null;
    products.nextLink = products.hasNextPage
      ? `${baseUrl}/products?page=${products.nextPage}`
      : null;

    if (products.prevLink && paginate.limit !== 10)
      products.prevLink += `&limit=${paginate.limit}`;
    if (products.nextLink && paginate.limit !== 10)
      products.nextLink += `&limit=${paginate.limit}`;

    if (products.prevLink && paginate.sort)
      products.prevLink += `&sort=${params.sort}`;
    if (products.nextLink && paginate.sort)
      products.nextLink += `&sort=${params.sort}`;

    return products;
  }

  async getProductByID(pid) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      throw new Error("ID de producto inválido");
    }

    const product = await productModel.findOne({ _id: pid });

    if (!product) {
      throw new Error(`El producto con ID ${pid} no existe`);
    }

    return product;
  }

  async createProduct(product) {
    const { title, description, code, price, stock, category, thumbnails } =
      product;

    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error(
        "Error al crear el producto: Todos los campos son obligatorios"
      );
    }

    const existingProduct = await productModel.findOne({ code });
    if (existingProduct) {
      throw new Error("El código de producto ya existe");
    }

    const newProduct = new productModel({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });
    await newProduct.save(); 
    return newProduct;
  }

  async updateProduct(pid, productUpdate) {
    const product = await this.getProductByID(pid);

    const updatedProduct = await productModel.updateOne(
      { _id: pid },
      productUpdate
    );

    if (updatedProduct.nModified === 0) {
      throw new Error(`No se pudo actualizar el producto con ID ${pid}`);
    }

    const productAfterUpdate = await productModel.findOne({ _id: pid });
    return productAfterUpdate;
  }

  async deleteProduct(pid) {
    const product = await this.getProductByID(pid);

    const result = await productModel.deleteOne({ _id: pid });

    if (result.deletedCount === 0) {
      throw new Error(`No se pudo eliminar el producto con ID ${pid}`);
    }

    return { message: `Producto con ID ${pid} eliminado exitosamente` };
  }
}

export { productDBManager };
