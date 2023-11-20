
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'

export type NextPayDocument = HydratedDocument<NextPay>

@Schema()
export class NextPay
{
    @Prop()
    api_key: number

    @Prop()
    order_id: string

    @Prop()
    amount: number

    @Prop()
    callback_uri: string

    @Prop()
    linkToPay: string

    @Prop()
    orderId: string

    @Prop()
    trans_id: string

    @Prop( { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' } )
    wallet: string
}

export const NextPaySchema = SchemaFactory.createForClass( NextPay )

