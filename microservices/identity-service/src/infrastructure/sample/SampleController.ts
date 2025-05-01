import { Controller, Get, Post, Body } from '@nestjs/common';
import { HandleSampleUseCase } from '@identity/application/sample/HandleSampleUseCase';
import { SampleRequestDto } from '@identity/application/sample/dto/SampleRequestDto';

@Controller('sample')
export class SampleController {
  constructor(private readonly handleSampleUseCase: HandleSampleUseCase) {}

  @Get('database')
  async sayHello() {
    return this.handleSampleUseCase.getMessageFromDatabase();
  }

  @Get('external')
  async sayHelloFromExternal() {
    return this.handleSampleUseCase.getMessageFromExternalService();
  }

  @Post()
  async sayMessage(@Body() dto: SampleRequestDto) {
    return this.handleSampleUseCase.setMessageInDatabase(dto);
  }
}
