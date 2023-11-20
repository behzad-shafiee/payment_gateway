import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Log, LogSchema } from 'src/database/schema/log.schema'
import { GlobalModule } from 'src/global/global.module'
import { MongoLogger } from 'src/logger/mongo.logger'
import { CoreModule } from '../module/core/core.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module( {
  imports: [
    ConfigModule.forRoot( {
      isGlobal: true,
    } ),
    MongooseModule.forRootAsync( {
      useFactory: async () =>
      {
        return {
          uri: 'mongodb://127.0.0.1/payment-nest'
        }
      }
    } ),
    MongooseModule.forFeature( [ { name: Log.name, schema: LogSchema } ] ),
    CoreModule,
    GlobalModule
  ],
  controllers: [ AppController ],
  providers: [ AppService, MongoLogger ],
  exports: [ MongoLogger ]
} )
export class AppModule { }
