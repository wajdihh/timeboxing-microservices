import { Controller, Get, Post, Body } from '@nestjs/common';
import { SampleService } from '@identity/application/services/SampleService';
import { SampleRequestDto } from '@identity/application/dto/requests/SampleRequestDto';

@Controller('sample')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get('database')
  async sayHello() {
    return this.sampleService.getMessageFromDatabase();
  }

  @Get('external')
  async sayHelloFromExternal() {
    return this.sampleService.getMessageFromExternalService();
  }

  @Post()
  async sayMessage(@Body() dto: SampleRequestDto) {
    return this.sampleService.setMessageInDatabase(dto);
  }
}
