import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { HydratedDocument } from "mongoose"
import { LogCategoryEnum } from "src/enum/log/category.enum"
import { LogTypeEnum } from "src/enum/log/type.enum"

export type LogDocument = HydratedDocument<Log>

@Schema()
export class Log
{
    @Prop( { type: String, required: false } )
    message: string

    @Prop( { type: String, required: false, enum: LogCategoryEnum } )
    category: LogCategoryEnum

    @Prop( { type: String, required: true, enum: LogTypeEnum } )
    type: LogTypeEnum

    @Prop( { required: false, type: [ MongooseSchema.Types.Mixed ] } )
    optionalParams?: any[]
}

export const LogSchema = SchemaFactory.createForClass( Log )