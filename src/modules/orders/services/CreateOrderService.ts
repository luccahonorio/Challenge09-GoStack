/* eslint-disable camelcase */
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('The Customer does not exists');
    }

    const check = products.find(
      product => product.quantity <= 0 || !product.quantity,
    );

    if (check) {
      throw new AppError('Invalid quantity from product');
    }

    const ProductsId = products.map(product => {
      return { id: product.id };
    });

    const findProducts = await this.productsRepository.findAllById(ProductsId);

    if (!findProducts) {
      throw new AppError('Invalid product Id!');
    }

    const arrayProducts = findProducts.map(product => {
      const finalproduct = products.find(
        ProductFind => ProductFind.id === product.id,
      );
      return {
        product_id: product.id,
        price: product.price,
        quantity: finalproduct?.quantity || 0,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: arrayProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
