import * as productService from '../services/product.service.js';

export const list = async (req, res) => {
  const products = await productService.listProducts(req.user.restaurantId);
  res.json({ products });
};

export const create = async (req, res) => {
  const product = await productService.createProduct(req.user.restaurantId, req.validated.body);
  res.status(201).json({ product });
};

export const update = async (req, res) => {
  const product = await productService.updateProduct(
    req.user.restaurantId,
    req.validated.params.id,
    req.validated.body
  );
  res.json({ product });
};

export const remove = async (req, res) => {
  await productService.deleteProduct(req.user.restaurantId, req.validated.params.id);
  res.status(204).send();
};

