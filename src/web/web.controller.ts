import { Controller, Get , Render} from '@nestjs/common';
import { WebService } from './web.service';

@Controller('web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get('')
  @Render('index')
  getIndex(){
    return {message: 'how are you'}
  } 
}
