import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Log, LogSchema } from 'src/database/schema/log.schema'
import { MongoLogger } from 'src/logger/mongo.logger'

@Global()
@Module( {
    imports: [
        MongooseModule.forFeature( [ { name: Log.name, schema: LogSchema } ] ),
    ],
    providers: [ MongoLogger ],
    exports: [ MongoLogger ],
} )
export class GlobalModule { }