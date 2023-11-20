import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'


export type WalletDocument = HydratedDocument<Wallet>

@Schema()
export class Wallet
{
    @Prop( { type: String, required: true } )
    userId: string

    @Prop( { type: Number, required: true } )
    balance: number
}

export const WalletSchema = SchemaFactory.createForClass( Wallet )