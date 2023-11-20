import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BitPay, BitPaySchema } from 'src/database/schema/bit-pay/bit-pay.schema'
import { NextPay, NextPaySchema } from 'src/database/schema/next-pay/next_pay.schema'
import { Zibal, ZibalSchema } from 'src/database/schema/zibal/zibal.schema'
import { CoreController } from './core.controller'
import { CoreService } from './core.service'
import { BitPayService } from './sub-services/bit-pay.service'
import { NextPayService } from './sub-services/next_pay.service'
import { ZibalService } from './sub-services/zibal.service'
import { MongoLogger } from 'src/logger/mongo.logger'
import { Log, LogSchema } from 'src/database/schema/log.schema'
import { Wallet, WalletSchema } from 'src/database/schema/wallet.schema'


@Module( {
  imports: [
    MongooseModule.forFeature( [
      { name: Zibal.name, schema: ZibalSchema },
      { name: NextPay.name, schema: NextPaySchema },
      { name: BitPay.name, schema: BitPaySchema },
      { name: Log.name, schema: LogSchema },
      { name: Wallet.name, schema: WalletSchema },
    ] ),
    HttpModule ],
  controllers: [ CoreController ],
  providers: [ CoreService, BitPayService, NextPayService, ZibalService, MongoLogger ]
} )
export class CoreModule { }
