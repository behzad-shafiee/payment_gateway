import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateNextPayDto 
{
    @ApiProperty( { default: 1000000 } )
    @IsNotEmpty()
    amount: number

    @ApiProperty( { default: "09386020898" } )
    @IsOptional()
    customer_phone: string

    @ApiProperty( { default: "64a295939b8367e3d292b982" } )
    @IsNotEmpty()
    userId: string
}