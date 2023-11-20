import { ApiProperty } from '@nestjs/swagger'

export class ZibalVerifyDto {

    @ApiProperty({ default: "zibal" })
    merchant: string

    @ApiProperty({ default: 300000 })
    trackId: number
}
