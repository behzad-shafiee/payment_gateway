import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateZibalDto 
{

    @ApiProperty( { default: "55f51sd5f45sd1f54s5f1d35s1fsfd1" } )
    @IsNotEmpty()
    userId: string

    @ApiProperty( { default: 300000 } )
    @IsNotEmpty()
    amount: number

    @ApiProperty( { default: "test-payment-zibal" } )
    @IsOptional()
    description: string

    @ApiProperty( { default: "09386020898" } )
    @IsOptional()
    mobile: string

    @ApiProperty( { default: "5657235545896521" } )
    @IsOptional()
    allowedCards: string

    @ApiProperty( { default: true } )
    @IsOptional()
    sms: boolean
}
