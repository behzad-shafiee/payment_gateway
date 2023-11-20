import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { lastValueFrom, map } from 'rxjs'
import { LogCategoryEnum } from 'src/enum/log/category.enum'
import { MongoLogger } from 'src/logger/mongo.logger'
import { Zibal } from '../../../database/schema/zibal/zibal.schema'
import { CreateZibalDto } from '../dto/zibal/create-zibal.dto'
import { ZibalVerifyDto } from '../dto/zibal/zibal-verify.dto'
import { PaymentGatewayTypeEnum } from '../enum/payment-gateway-type.enum'
import { Wallet } from 'src/database/schema/wallet.schema'


@Injectable()
export class ZibalService
{
    constructor (
        @InjectModel( Zibal.name ) private zibalModel: Model<Zibal>,
        @InjectModel( Wallet.name ) private walletModel: Model<Wallet>,
        private readonly httpService: HttpService,
        private readonly mongoLogger: MongoLogger

    ) { }

    async payment ( createZibalDto: CreateZibalDto )
    {
        try
        {
            let message: string = ""

            const orderId = String( Date.now() ) + "zibal_orderId"
            const response = await lastValueFrom(
                this.httpService.post( process.env.ZIBAL_CREATE_TOKEN_URL, {
                    "merchant": process.env.ZIBAL_MERCHANT,
                    "amount": createZibalDto.amount,
                    "callbackUrl": process.env.ZIBAL_CALLBACK_URL,
                    "description": createZibalDto?.description,
                    "orderId": orderId,
                    "mobile": createZibalDto?.mobile,
                    "allowedCards": createZibalDto?.allowedCards,
                    "linkToPay": true,
                    "sms": createZibalDto?.sms
                } ).pipe(
                    map( ( response ) =>
                    {
                        return response.data
                    } ),
                ),
            )

            let zibal = new this.zibalModel()
            zibal.amount = createZibalDto.amount
            zibal.callbackUrl = process.env.ZIBAL_CALLBACK_URL
            zibal.mobile = createZibalDto?.mobile
            zibal.orderId = orderId
            zibal.allowedCards = [ createZibalDto?.allowedCards ]
            zibal.linkToPay = response.linkToPay
            zibal.userId = createZibalDto.userId
            const result = await zibal.save()
            console.log( result )

            if ( !result )
            {
                throw new Error( "zibal model does not created in database" )
            }

            if ( response.result === 100 )
            {
                await this.mongoLogger.log( 'amount is more than limited transaction', LogCategoryEnum.TransactionPending, {
                    zibalId: zibal.id
                } )
                return {
                    payment_type: PaymentGatewayTypeEnum.Zibal,
                    data: response
                }
            }
            else if ( response.result === 102 )
            {
                await this.mongoLogger.log( 'merchant not found', LogCategoryEnum.TransactionFailed, {
                    zibalId: zibal.id
                } )
                message = 'merchantیافت نشد.'
            }
            else if ( response.result === 103 )
            {
                await this.mongoLogger.log( 'merchant is inactive', LogCategoryEnum.TransactionFailed, {
                    zibalId: zibal.id
                } )
                message = 'merchantغیرفعال'
            }
            else if ( response.result === 104 )
            {
                await this.mongoLogger.log( 'merchant is invalid', LogCategoryEnum.TransactionFailed, {
                    zibalId: zibal.id
                } )
                message = 'merchantنامعتبر'
            }

            else if ( response.result === 105 )
            {
                await this.mongoLogger.log( 'amount must be more than 1000 Rial', LogCategoryEnum.TransactionFailed, {
                    zibalId: zibal.id
                } )
                message = 'amount بایستی بزرگتر از 1,000 ریال باشد.'
            }

            else if ( response.result === 106 )
            {
                await this.mongoLogger.log( 'callbackUrl is invalid , it must start with (http/https)', LogCategoryEnum.TransactionFailed, {
                    zibalId: zibal.id
                } )
                message = 'callbackUrl نامعتبر می‌باشد. (شروع با http و یا https)'
            }
            else if ( response.result === 113 )
            {
                await this.mongoLogger.log( 'amount is more than limited transaction', LogCategoryEnum.TransactionFailed, {
                    zibalId: zibal.id
                } )
                message = 'amount مبلغ تراکنش از سقف میزان تراکنش بیشتر است.'
            }
            return {
                payment_type: PaymentGatewayTypeEnum.Zibal,
                message
            }
        } catch ( error )
        {
            console.log( error )
            throw error
        }
    }

    async logStatusPayment ( query )
    {
        console.log( query )

        let status = ''
        let success = true

        if ( !query )
        {
            throw new Error( "err happened, query does not exist" )
        }

        //set message for success based on number
        if ( query.success == 0 )
            success = false

        const zibal = await this.zibalModel.findOne( { orderId: query.orderId } )
        if ( !zibal )
            throw new Error( "orderId is wrong" )
        zibal.trackId = query.trackId
        await zibal.save()

        //set message for status based on number
        if ( query.status == 1 || query.status == 2 )
        {
            if ( query.status == 1 )
            {
                await this.mongoLogger.log( 'payment done but transaction does not confirm', LogCategoryEnum.PaymentDoneWithoutConfirmation, {
                    zibalId: zibal.id
                } )
                status = 'پرداخت شده - تاییدشده'
            }
            await this.mongoLogger.log( 'payment done and transaction confirmed', LogCategoryEnum.TransactionSuccess, {
                zibalId: zibal.id
            } )
            status = 'پرداخت شده - تاییدنشده'

            const wallet = new this.walletModel()
            wallet.balance = zibal.amount
            wallet.userId = zibal.userId
            await wallet.save()
            
            await this.zibalModel.findOneAndUpdate( { orderId: query.orderId }, { wallet } )
        }
        else if ( query.status == -1 )
        {
            await this.mongoLogger.log( 'waiting for payment', LogCategoryEnum.TransactionPending, {
                zibalId: zibal.id
            } )
            status = 'در انتظار پردخت'
        } else if ( query.status == -2 )
        {
            await this.mongoLogger.log( 'Internal Error', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = 'خطای داخلی'
        } else if ( query.status == 3 )
        {
            await this.mongoLogger.log( 'user canceled transaction', LogCategoryEnum.TransactionCanceled, {
                zibalId: zibal.id
            } )
            status = 'لغو شده توسط کاربر'
        } else if ( query.status == 4 )
        {
            await this.mongoLogger.log( 'cardNumber is invalid', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = '‌شماره کارت نامعتبر می‌باشد.'
        } else if ( query.status == 5 )
        {
            await this.mongoLogger.log( 'account balance is not enough', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = '‌موجودی حساب کافی نمی‌باشد.'
        } else if ( query.status == 6 )
        {
            await this.mongoLogger.log( 'password was wrong', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = 'رمز واردشده اشتباه می‌باشد.'
        } else if ( query.status == 7 )
        {
            await this.mongoLogger.log( 'the number of request is alot', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = '‌تعداد درخواست‌ها بیش از حد مجاز می‌باشد.'
        } else if ( query.status == 8 )
        {
            await this.mongoLogger.log( 'the daily number of payment  is more than limitaion', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = '‌تعداد پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد.'
        } else if ( query.status == 9 )
        {
            await this.mongoLogger.log( 'the daily amount of payment  is more than limitaion', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = 'مبلغ پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد.'
        } else if ( query.status == 10 )
        {
            await this.mongoLogger.log( 'Card issuer is invalid', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = '‌صادرکننده‌ی کارت نامعتبر می‌باشد'
        } else if ( query.status == 11 )
        {
            await this.mongoLogger.log( 'switch error', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = '‌خطای سوییچ'
        } else if ( query.status == 12 )
        {
            await this.mongoLogger.log( 'card is inaccessible', LogCategoryEnum.TransactionError, {
                zibalId: zibal.id
            } )
            status = 'کارت قابل دسترسی نمی‌باشد.'
        }

        query.success = success
        query.status = status

        console.log( query )
        return
    }

    async verify ( zibalVerifyDto: ZibalVerifyDto )
    {
        try
        {
            const responseData = await lastValueFrom(
                this.httpService.post( process.env.ZIBAL_VERIFY_URL, {
                    "merchant": zibalVerifyDto.merchant,
                    "trackId": zibalVerifyDto.trackId
                } ).pipe(
                    map( ( response ) =>
                    {
                        return response.data
                    } ),
                )
            )
            return {
                payment_type: PaymentGatewayTypeEnum.Zibal,
                data: responseData
            }
        } catch ( error )
        {
            console.log( error )
            throw error
        }
    }
}
