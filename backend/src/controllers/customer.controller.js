import * as customerService from '../services/customer.service.js';

export const list = async (req, res) => {
  const customers = await customerService.listCustomers(req.user.restaurantId, req.validated?.query?.search);
  res.json({ customers });
};

export const detail = async (req, res) => {
  const customer = await customerService.getCustomer(req.user.restaurantId, req.validated.params.id);
  res.json({ customer });
};

export const updateNotes = async (req, res) => {
  const customer = await customerService.updateCustomerNotes(
    req.user.restaurantId,
    req.validated.params.id,
    req.validated.body.notes
  );
  res.json({ customer });
};