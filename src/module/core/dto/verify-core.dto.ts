import { ApiProperty, ApiQuery } from "@nestjs/swagger"
import { IsNotEmpty, ValidateNested } from "class-validator"
import { PaymentGatewayTypeEnum } from "../enum/payment-gateway-type.enum"
import { Type, TypeHelpOptions } from "class-transformer"
import { ZibalVerifyDto } from "./zibal/zibal-verify.dto"  
import { BitPayVerifyDto } from "src/module/core/dto/bit-pay/bit-pay.verify.dto"

export class VerifyCoreDto
{

    @ApiProperty( { default: PaymentGatewayTypeEnum.Zibal } )
    @IsNotEmpty()
    payment_gateway_type: PaymentGatewayTypeEnum

    @ApiProperty( { default: { merchant: "zibal", trackId: "3255401660" } } )
    @ValidateNested()
    @Type( ( data: TypeHelpOptions ) =>
    {
        switch ( data.object.payment_gateway_type )
        {
            case "zibal":
                return ZibalVerifyDto
            case 'bit_pay':
                return BitPayVerifyDto
        }
        return ZibalVerifyDto
    } )
    data: Record<string, any>
}
