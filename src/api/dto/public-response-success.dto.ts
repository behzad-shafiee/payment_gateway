import { PaymentGatewayTypeEnum } from "src/module/core/enum/payment-gateway-type.enum"
import { StatusPublicResponseEnum } from "../enum/status-public-response.enum"

export class PublicResponseDto
{
    status: StatusPublicResponseEnum

    payment_type: PaymentGatewayTypeEnum

    data?: any
    
    message?:string

}