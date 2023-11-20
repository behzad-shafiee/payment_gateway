import { Injectable } from '@nestjs/common'
import { BitPayService } from './sub-services/bit-pay.service'
import { ZibalService } from './sub-services/zibal.service'
import { PymentCoreDto } from './dto/payment-core.dto'
import { VerifyCoreDto } from './dto/verify-core.dto'
import { PaymentGatewayTypeEnum } from './enum/payment-gateway-type.enum'

@Injectable()
export class CoreService
{
  constructor (
    private readonly zibalService: ZibalService,
    private readonly bitPayService: BitPayService
  ) { }

  async payment ( pymentCoreDto: PymentCoreDto )
  {
    switch ( pymentCoreDto.payment_gateway_type )
    {
      case PaymentGatewayTypeEnum.Zibal:
        console.log( 'payment is Zibal' )
        let zibalInfo: any = pymentCoreDto.data
        return await this.zibalService.payment( zibalInfo )

      case PaymentGatewayTypeEnum.Zarinpal:
        console.log( 'payment is zarinpal' )
        break

      case PaymentGatewayTypeEnum.NextPay:
        console.log( 'payment is NextPay' )
        break

      case PaymentGatewayTypeEnum.BitPay:
        console.log( 'payment is BitPay' )
        const bitPayInfo: any = pymentCoreDto.data
        return await this.bitPayService.payment( bitPayInfo )
    }
    return
  }

  async verify ( verifyCoreDto: VerifyCoreDto )
  {
    switch ( verifyCoreDto.payment_gateway_type )
    {
      case PaymentGatewayTypeEnum.Zibal:
        console.log( 'payment is Zibal' )
        let zibalInfo: any = verifyCoreDto.data
        console.log( zibalInfo )
        const result = await this.zibalService.verify( zibalInfo )
        console.log( result )
        return result


      case PaymentGatewayTypeEnum.Zarinpal:
        console.log( 'payment is zarinpal' )
        break

      case PaymentGatewayTypeEnum.NextPay:
        console.log( 'payment is NextPay' )
        break

      case PaymentGatewayTypeEnum.BitPay:
        console.log( 'payment is BitPay' )
        const bitPayInfo: any = verifyCoreDto.data
        return await this.bitPayService.verify( bitPayInfo )
    }
  }

}
