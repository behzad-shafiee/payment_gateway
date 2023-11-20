import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export function setSwagger ( app: INestApplication )
{
    const config = new DocumentBuilder()
        .setTitle( process.env.SWAGGER_TITLE )
        .setDescription( process.env.SWAGGER_DESCRIPTION )
        .setVersion( process.env.SWAGGER_VERSION )
        .build()
    const document = SwaggerModule.createDocument( app, config )
    SwaggerModule.setup( process.env.SWAGGER_URL, app, document )
}