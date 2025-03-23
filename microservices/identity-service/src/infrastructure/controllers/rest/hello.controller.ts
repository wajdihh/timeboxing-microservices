import { Controller, Get } from '@nestjs/common';
import { HelloUseCase } from '../../../application/services/hello.service';

@Controller('hello')
export class HelloController {
  constructor(private readonly helloUseCase: HelloUseCase) {}

  @Get()
  async sayHello() {
    return this.helloUseCase.execute();
  }
}
