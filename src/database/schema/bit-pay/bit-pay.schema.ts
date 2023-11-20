import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'

export type BitPayDocument = HydratedDocument<BitPay>

@Schema()
export class BitPay
{
    @Prop( { type: String } )
    api: string

    @Prop( { type: Number } )
    amount: number

    @Prop( { type: String } )
    userId: string

    @Prop( { type: String, required: false } )
    description?: string

    @Prop( { type: String } )
    factorId: string

    @Prop( { type: String, required: false } )
    transactionId?: string

    @Prop( { type: String, required: false } )
    cardNumber?: string

    @Prop( { type: String } )
    payment_page_id: number

    @Prop( { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' } )
    wallet: string
}

export const BitPaySchema = SchemaFactory.createForClass( BitPay )