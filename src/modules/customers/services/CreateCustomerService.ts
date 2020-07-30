import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    // TODO
    const checkifexistCustomer = await this.customersRepository.findByEmail(
      email,
    );

    if (checkifexistCustomer) {
      throw new AppError('This Email has already register');
    }

    const custumer = await this.customersRepository.create({
      name,
      email,
    });

    return custumer;
  }
}

export default CreateCustomerService;
