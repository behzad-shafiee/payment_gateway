import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'
import { Wallet } from '../wallet.schema'

export type ZibalDocument = HydratedDocument<Zibal>

@Schema()
export class Zibal
{
  @Prop( { type: Number } )
  amount: number

  @Prop( { type: String } )
  callbackUrl: string

  @Prop( { type: String, required: false } )
  mobile?: string

  @Prop( { type: Array, required: false } )
  allowedCards?: string[]

  @Prop( { type: String } )
  linkToPay: string

  @Prop( { type: String } )
  orderId: string

  @Prop( { type: String, required: false } )
  trackId?: string

  @Prop( { type: String } )
  userId: string

  @Prop( { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' } )
  wallet: Wallet

}

export const ZibalSchema = SchemaFactory.createForClass( Zibal )