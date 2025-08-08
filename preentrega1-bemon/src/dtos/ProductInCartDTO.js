export default class ProductInCartDTO {
  constructor(productInCart) {
    this.productId = productInCart.product._id;
    this.title = productInCart.product.title;
    this.price = productInCart.product.price;
    this.quantity = productInCart.quantity;
  }
}
