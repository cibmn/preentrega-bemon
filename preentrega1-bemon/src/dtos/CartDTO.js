import ProductInCartDTO from './ProductInCartDTO.js';

export default class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products.map(p => new ProductInCartDTO(p));
    this.totalPrice = cart.products.reduce(
      (acc, p) => acc + p.product.price * p.quantity,
      0
    );
  }
}
