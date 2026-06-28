import * as productService from '../services/product.service.js';

export const list = async (req, res) => {
  const result = await productService.listProducts(req.user.restaurantId, req.validated?.query || {});
  res.json(result);
};

export const create = async (req, res) => {
  const product = await productService.createProduct(req.user.restaurantId, req.validated.body);
  res.status(201).json({ product });
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Debes enviar una imagen' });
    return;
  }

  const filePath = `/uploads/products/${req.file.filename}`;
  res.status(201).json({ imageUrl: filePath });
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

