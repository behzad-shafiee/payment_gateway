import { ApiProperty } from "@nestjs/swagger"
import { Type, TypeHelpOptions } from "class-transformer"
import { IsNotEmpty, ValidateNested } from "class-validator"
import { CreateZibalDto } from "src/module/core/dto/zibal/create-zibal.dto"
import { PaymentGatewayTypeEnum } from "../enum/payment-gateway-type.enum"
import { CreateBitPayDto } from "./bit-pay/create-bit-pay.dto"

export class PymentCoreDto
{

    @ApiProperty( { default: PaymentGatewayTypeEnum.Zibal } )
    @IsNotEmpty()
    payment_gateway_type: PaymentGatewayTypeEnum

    @ApiProperty( { default: { userId: "656asdasdadjnad74a547d65a4d1a", amount: 300000, description: "test-payment-zibal", mobile: "09386020898", allowedCards: "5657235545896521", sms: true } } )
    @ValidateNested()
    @Type( ( data: TypeHelpOptions ) =>
    {
        switch ( data.object.payment_gateway_type )
        {
            case PaymentGatewayTypeEnum.Zibal:
                return CreateZibalDto
            case PaymentGatewayTypeEnum.BitPay:
                return CreateBitPayDto
        }

        return CreateZibalDto
    } )

    data: Record<string, any>
}
