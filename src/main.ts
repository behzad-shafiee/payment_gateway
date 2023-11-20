import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app/app.module'
import GlobalExceptionFilter from './filter/global.exception.filter'
import { setSwagger } from './function/swagger.function'
import { MongoLogger } from './logger/mongo.logger'

async function bootstrap ()
{
  const app = await NestFactory.create<NestExpressApplication>( AppModule )

  app.useGlobalPipes( new ValidationPipe() )

  app.useGlobalFilters( new GlobalExceptionFilter( app.get<MongoLogger>( MongoLogger ) ) )

  setSwagger( app )


  const port = process.env.APP_PORT
  const host = process.env.APP_HOST

  await app.listen( port, host, () =>
  {
    console.log( `Server is running on ===> ${ host }:${ port }` )
  } )

}
bootstrap()
