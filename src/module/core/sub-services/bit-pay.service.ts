import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { lastValueFrom, map } from 'rxjs'
import { Log } from 'src/database/schema/log.schema'
import { LogCategoryEnum } from 'src/enum/log/category.enum'
import { MongoLogger } from 'src/logger/mongo.logger'
import { BitPay } from '../../../database/schema/bit-pay/bit-pay.schema'
import { BitPayVerifyDto } from '../dto/bit-pay/bit-pay.verify.dto'
import { CreateBitPayDto } from '../dto/bit-pay/create-bit-pay.dto'
import { PaymentGatewayTypeEnum } from '../enum/payment-gateway-type.enum'
import { Wallet } from 'src/database/schema/wallet.schema'

@Injectable()
export class BitPayService
{

    constructor (
        @InjectModel( BitPay.name ) private bitPayModel: Model<BitPay>,
        @InjectModel( Wallet.name ) private walletModel: Model<Wallet>,
        @InjectModel( Log.name ) private logModel: Model<Log>,
        private readonly httpService: HttpService,
        private readonly mongoLogger: MongoLogger
    ) { }

    async payment ( createBitPayDto: CreateBitPayDto )
    {
        try
        {
            const factorId = String( Date.now() )
            const form = new FormData()
            form.append( "api", process.env.BITPAY_API ) //your_api -> required
            form.append( "amount", String( createBitPayDto.amount ) ) //your_amount -> required
            form.append( "redirect", process.env.BITPAY_REDIRECT ) //your_redirect -> required
            form.append( "name", createBitPayDto?.name ) //your_name -> optional
            form.append( "email", createBitPayDto?.email ) //your_email -> optional
            form.append( "description", createBitPayDto?.description ) //your_description -> optional
            form.append( "factorId", factorId ) //your_factorId -> optional
            const response = await lastValueFrom(
                this.httpService.post( 'https://bitpay.ir/payment-test/gateway-send', form ).pipe(
                    map( ( response ) =>
                    {
                        console.log( response.data )
                        return response.data
                    } ),
                ),
            )

            let bitpay = new this.bitPayModel()
            bitpay.api = process.env.BITPAY_API
            bitpay.amount = createBitPayDto.amount
            bitpay.userId = createBitPayDto.userId
            bitpay.description = createBitPayDto.description
            bitpay.factorId = factorId
            bitpay.api = process.env.BITPAY_API
            bitpay.payment_page_id = response
            const result = await bitpay.save()

            if ( !result )
            {
                throw new Error( "bitpay model does not created in database" )
            }

            //set message based of response number
            if ( response === -1 )
            {
                await this.mongoLogger.log( 'the api that sent is not correct', LogCategoryEnum.TransactionError, {
                    bitpayId: bitpay.id
                } )
                return {
                    payment_type: PaymentGatewayTypeEnum.BitPay,
                    message: 'خطا: API ارسالی صحیح نیست!'
                }
            }
            else if ( response === -2 )
            {
                await this.mongoLogger.log( 'amount must be number and more than 1000 Rial', LogCategoryEnum.TransactionError, {
                    bitpayId: bitpay.id
                } )
                return {
                    payment_type: PaymentGatewayTypeEnum.BitPay,
                    message: 'خطا: amount داده عددی نمی باشد یا کمتر از 1000 ريال می باشد'
                }
            }

            else if ( response === -3 )
            {
                await this.mongoLogger.log( 'redirect must fill', LogCategoryEnum.TransactionError, {
                    bitpayId: bitpay.id
                } )
                return {
                    payment_type: PaymentGatewayTypeEnum.BitPay,
                    message: 'خطا: مقدار redirect رشته null است'
                }
            }
            else if ( response === -4 )
            {
                await this.mongoLogger.log( 'the payment-gatetwy with your info sended not exist or it is pending', LogCategoryEnum.TransactionError, {
                    bitpayId: bitpay.id
                } )
                return {
                    payment_type: PaymentGatewayTypeEnum.BitPay,
                    message: 'خطا: درگاهی با اطلاعات ارسالی شما وجود ندارد و یا در حالت انتظار میباشد'
                }
            }
            else if ( response === -5 )
            {
                await this.mongoLogger.log( 'err in connecting to payment-gateway please try again ', LogCategoryEnum.TransactionError, {
                    bitpayId: bitpay.id
                } )
                return {
                    payment_type: PaymentGatewayTypeEnum.BitPay,
                    message: 'خطا: خطا در اتصال به درگاه، لطفا مجددا تلاش کنید'
                }
            }
            else if ( typeof response === 'number' && response > 0 )
            {
                {
                    await this.mongoLogger.log( 'payment info recieved from user and payment-gateway-url sended', LogCategoryEnum.TransactionPending, {
                        bitpayId: bitpay.id
                    } )
                    return {
                        payment_type: PaymentGatewayTypeEnum.BitPay,
                        data: {
                            payment_url: `https://bitpay.ir/payment-test/gateway-${ response }-get`
                        }
                    }
                }
            }

        } catch ( error )
        {
            console.log( error )
            throw error
        }
    }

    async logStatusPayment ( query )
    {
        if ( !query )
        {
            throw new Error( "err happened, query does not exist" )
        }
        const bitPay = await this.bitPayModel.findOne( { factorId: query.factorId } )
        if ( !bitPay )
            throw new Error( "factorId is wrong!!!" )

        bitPay.transactionId = query.trans_id
        bitPay.cardNumber = query.cardNum
        await bitPay.save()

        const wallet = new this.walletModel()
        wallet.balance = bitPay.amount
        wallet.userId = bitPay.userId
        await wallet.save()
        
        await this.bitPayModel.findOneAndUpdate( { orderId: query.orderId }, { wallet } )

        console.log( query )
        return
    }

    async verify ( bitPayVerifyDto: BitPayVerifyDto )
    {
        try
        {
            let status = ""

            const form = new FormData()
            form.append( "api", bitPayVerifyDto.api )
            form.append( "trans_id", String( bitPayVerifyDto.trans_id ) )
            form.append( "id_get", bitPayVerifyDto.id_get )
            form.append( "json", "1" )

            const responseData = await lastValueFrom(
                this.httpService.post( process.env.BITPAY_VERIFY_URL, form ).pipe(
                    map( ( response ) =>
                    {
                        return response.data
                    } ),
                )
            )

            if ( responseData.status == 1 )
            {
                status = 'تراکنش موفقیت آمیز بوده است'
                responseData.status = status
                return {
                    payment_type: PaymentGatewayTypeEnum.BitPay,
                    data: responseData
                }
            } else if ( responseData.status == -2 )
            {
                status = 'trans_id ارسال شده، داده عددي نمیباشد'
            } else if ( responseData.status == -3 )
            {
                status = 'id_get ارسال شده، داده عددي نمیباشد'
            } else if ( responseData.status == -4 )
            {
                status = 'چنین تراکنشی در پایگاه وجود ندارد و یا موفقیت آمیز نبوده است'
            } else if ( responseData.status == -1 )
            {
                status = 'API ارسالی با نوع API تعریف شده در bitpay سازگار نیست'
            } else if ( responseData.status == 11 )
            {
                status = 'تراکنش از قبل وریفاي شده است'
            }
            responseData.status = status
            return {
                payment_type: PaymentGatewayTypeEnum.BitPay,
                message: status
            }

        } catch ( error )
        {
            console.log( error )
            throw error
        }
    }

}
