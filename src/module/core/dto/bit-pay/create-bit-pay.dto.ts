import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional } from "class-validator"

export class CreateBitPayDto
{
    @ApiProperty( { default: 50000 } )
    @IsNotEmpty()
    amount: number

    @ApiProperty( { default: "656asdasdadjnad74a547d65a4d1a" } )
    @IsNotEmpty()
    userId: string

    @ApiProperty( { default: "behzad" } )
    @IsOptional()
    name: string

    @ApiProperty( { default: "bitpay-test-api" } )
    @IsOptional()
    description: string

    @ApiProperty( { default: "behzad@email.com" } )
    @IsOptional()
    email: string
}
