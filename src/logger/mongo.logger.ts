import { Injectable, LogLevel, LoggerService } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Log, LogDocument } from "src/database/schema/log.schema"
import { LogCategoryEnum } from "src/enum/log/category.enum"
import { LogTypeEnum } from "src/enum/log/type.enum"

@Injectable()
export class MongoLogger implements LoggerService
{

    constructor ( @InjectModel( Log.name ) private logModel: Model<LogDocument> ) { }

    async log ( message: any, category?: LogCategoryEnum, ...optionalParams: any[] )
    {
        await this.saver( LogTypeEnum.Log, message, category, ...optionalParams )
    }

    async error ( message: any, category?: LogCategoryEnum, ...optionalParams: any[] )
    {
        await this.saver( LogTypeEnum.Error, message, category, ...optionalParams )
    }

    async warn ( message: any, category?: LogCategoryEnum, ...optionalParams: any[] )
    {
        await this.saver( LogTypeEnum.Warning, message, category, ...optionalParams )
    }

    async debug?( message: any, category?: LogCategoryEnum, ...optionalParams: any[] )
    {
        await this.saver( LogTypeEnum.Debug, message, category, ...optionalParams )
    }

    async verbose?( message: any, category?: LogCategoryEnum, ...optionalParams: any[] )
    {
        await this.saver( LogTypeEnum.Verbose, message, category, ...optionalParams )
    }

    setLogLevels?( levels: LogLevel[] )
    {
        throw new Error( 'Method not implemented.' )
    }

    async saver ( type: LogTypeEnum, message: any, category: LogCategoryEnum, ...optionalParams: Array<any> )
    {
        let _message
        switch ( typeof _message )
        {
            case 'object':

                _message = message.toString()

        }
        const log = new this.logModel( { type, message: message.toString(), category, optionalParams } )
        await log.save()
    }

}