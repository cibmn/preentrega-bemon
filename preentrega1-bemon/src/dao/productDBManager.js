import mongoose from "mongoose";
import productModel from "../models/productModel.js";

class productDBManager {
  // Obtener todos los productos con paginación y ordenación
  async getAllProducts(params) {
    const paginate = {
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
    };

    if (params.sort && (params.sort === "asc" || params.sort === "desc"))
      paginate.sort = { price: params.sort };

    // Paginación con productos
    const products = await productModel.paginate({}, paginate);

    // Verificar si no se encontraron productos
    if (!products.docs.length) {
      throw new Error("No se encontraron productos");
    }

    // Enlaces de paginación (previo y siguiente)
    const baseUrl = process.env.BASE_URL || "http://localhost:3000"; // Usar una variable de entorno para la URL base
    products.prevLink = products.hasPrevPage
      ? `${baseUrl}/products?page=${products.prevPage}`
      : null;
    products.nextLink = products.hasNextPage
      ? `${baseUrl}/products?page=${products.nextPage}`
      : null;

    // Añadir limit en los enlaces de paginación si no es 10
    if (products.prevLink && paginate.limit !== 10)
      products.prevLink += `&limit=${paginate.limit}`;
    if (products.nextLink && paginate.limit !== 10)
      products.nextLink += `&limit=${paginate.limit}`;

    // Añadir sort en los enlaces de paginación
    if (products.prevLink && paginate.sort)
      products.prevLink += `&sort=${params.sort}`;
    if (products.nextLink && paginate.sort)
      products.nextLink += `&sort=${params.sort}`;

    return products;
  }

  // Obtener un producto por su ID
  async getProductByID(pid) {
    // Verificar si el ID de producto es válido
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      throw new Error("ID de producto inválido");
    }

    const product = await productModel.findOne({ _id: pid });

    if (!product) {
      throw new Error(`El producto con ID ${pid} no existe`);
    }

    return product;
  }

  // Crear un nuevo producto
  async createProduct(product) {
    const { title, description, code, price, stock, category, thumbnails } =
      product;

    // Verificar que todos los campos sean válidos
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error(
        "Error al crear el producto: Todos los campos son obligatorios"
      );
    }

    // Verificar si ya existe un producto con el mismo código
    const existingProduct = await productModel.findOne({ code });
    if (existingProduct) {
      throw new Error("El código de producto ya existe");
    }

    // Crear y guardar el nuevo producto en la base de datos
    const newProduct = new productModel({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });
    await newProduct.save(); // Asegúrate de que el producto se guarde correctamente en la DB
    return newProduct;
  }

  // Actualizar un producto por su ID
  async updateProduct(pid, productUpdate) {
    // Verificar si el producto existe
    const product = await this.getProductByID(pid);

    // Actualizar el producto en la base de datos
    const updatedProduct = await productModel.updateOne(
      { _id: pid },
      productUpdate
    );

    // Verificar si la actualización fue exitosa
    if (updatedProduct.nModified === 0) {
      throw new Error(`No se pudo actualizar el producto con ID ${pid}`);
    }

    // Recoger el producto actualizado
    const productAfterUpdate = await productModel.findOne({ _id: pid });
    return productAfterUpdate;
  }

  // Eliminar un producto por su ID
  async deleteProduct(pid) {
    // Verificar si el producto existe
    const product = await this.getProductByID(pid);

    // Eliminar el producto de la base de datos
    const result = await productModel.deleteOne({ _id: pid });

    // Verificar si el producto fue eliminado
    if (result.deletedCount === 0) {
      throw new Error(`No se pudo eliminar el producto con ID ${pid}`);
    }

    return { message: `Producto con ID ${pid} eliminado exitosamente` };
  }
}

export { productDBManager };
