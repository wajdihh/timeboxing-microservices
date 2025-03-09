import { Controller, Get } from '@nestjs/common';
import { HelloUseCase } from '../domain/hello.usecase';

@Controller('hello')
export class HelloController {
  constructor(private readonly helloUseCase: HelloUseCase) {}

  @Get()
  async sayHello() {
    return this.helloUseCase.execute();
  }
}
