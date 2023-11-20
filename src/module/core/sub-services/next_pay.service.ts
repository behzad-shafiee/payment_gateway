import { Injectable } from '@nestjs/common'
import { CreateNextPayDto } from '../dto/next_pay/create-next_pay.dto'
import { InjectModel } from '@nestjs/mongoose'
import { NextPay } from '../../../database/schema/next-pay/next_pay.schema'
import { Model } from 'mongoose'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom, map } from 'rxjs'

@Injectable()
export class NextPayService
{
  constructor (
    @InjectModel( NextPay.name ) private nextPayModel: Model<NextPay>,
    private readonly httpService: HttpService

  ) { }

  async payment ( createNextPayDto: CreateNextPayDto )
  {
    try
    {
      const orderId = String( Date.now() ) + "next_pay_orderId"

      const responseData = await lastValueFrom(
        this.httpService.post( process.env.NEXTPAY_CREATE_TOKEN_URL, {
          "api_key": process.env.NEXTPAY_API_KEY,
          "order_id": orderId,
          "amount": createNextPayDto.amount,
          "callback_uri": process.env.NEXTPAY_CALLBACK_URL,
          "customer_phone": createNextPayDto?.customer_phone,
          "userId": createNextPayDto.userId
        } ).pipe(
          map( ( response ) =>
          {
            return response.data
          } ),
        ),
      )
      // let zibal = new this.zibalModel()
      // zibal.amount = createZibalDto.amount
      // zibal.callbackUrl = "http://localhost:3000/zibal/log-status-payment"
      // zibal.mobile = createZibalDto.mobile
      // zibal.orderId = orderId
      // zibal.allowedCards = createZibalDto.allowedCards
      // zibal.linkToPay = responseData.linkToPay
      // const result = await zibal.save()
      // if ( !result )
      // {
      //   throw new Error( "zibal model does not created in database" )
      // }

      return responseData

    } catch ( error )
    {
      console.log( error )
      throw error
    }
  }


  findAll ()
  {
    return `This action returns all nextPay`
  }

}
