import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });
    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const findProduct = await this.ormRepository.findOne({
      where: { name },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const idList = products.map(product => product.id);

    const orderList = await this.ormRepository.find({ id: In(idList) });

    if (idList.length !== orderList.length) {
      throw new AppError('Missing Product');
    }
    return orderList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    const productsData = await this.findAllById(products);
    const newproducts = productsData.map(productData => {
      const productFind = products.find(
        product => product.id === productData.id,
      );

      if (!productFind) {
        throw new AppError('product not find');
      }

      if (productData.quantity < productFind.quantity) {
        throw new AppError('Insufficient product quantity');
      }

      const newproduct = productData;

      newproduct.quantity -= productFind.quantity;

      return newproduct;
    });

    await this.ormRepository.save(newproducts);

    return newproducts;
  }
}

export default ProductsRepository;
