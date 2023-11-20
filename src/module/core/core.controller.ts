import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CoreService } from './core.service'
import { PymentCoreDto } from './dto/payment-core.dto'
import { VerifyCoreDto } from './dto/verify-core.dto'
import { BitPayService } from './sub-services/bit-pay.service'
import { ZibalService } from './sub-services/zibal.service'
import { PublicResponse } from 'src/api/interceptor/public-response.interceptor'

@ApiTags( 'core' )
@Controller( 'core' )
export class CoreController
{
  constructor (
    private readonly coreService: CoreService,
    private readonly bitPayService: BitPayService,
    private readonly zibalService: ZibalService,
  ) { }

  @UseInterceptors( PublicResponse )
  @Post( 'payment' )
  payment ( @Body() pymentCoreDto: PymentCoreDto )
  {
    return this.coreService.payment( pymentCoreDto )
  }

  @UseInterceptors( PublicResponse )
  @Post( 'verify' )
  verify ( @Body() verifyCoreDto: VerifyCoreDto )
  {
    return this.coreService.verify( verifyCoreDto )
  }

  @Get( 'zibal/log-status-payment' )
  ZiballogStatusPayment ( @Query() query )
  {
    return this.zibalService.logStatusPayment( query )
  }

  @Get( 'bit-pay/log-status-payment' )
  BitPaylogStatusPayment ( @Query() query )
  {
    return this.bitPayService.logStatusPayment( query )
  }

}


