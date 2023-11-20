import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional } from "class-validator"

export class BitPayVerifyDto
{
    @ApiProperty( { default: 23057 } )
    @IsNotEmpty()
    trans_id: number

    @ApiProperty( { default: 28957 } )
    @IsNotEmpty()
    id_get: string

    @ApiProperty( { default: "adxcv-zzadq-polkjsad-opp13opoz-1sdf455aadzmck1244567" } )
    @IsNotEmpty()
    api: string
}
