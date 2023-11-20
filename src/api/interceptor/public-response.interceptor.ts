import { CallHandler, Injectable, NestInterceptor } from "@nestjs/common"
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host"
import { Observable, map } from "rxjs"
import { PublicResponseDto } from "../dto/public-response-success.dto"
import { StatusPublicResponseEnum } from "../enum/status-public-response.enum"

@Injectable()
export class PublicResponse implements NestInterceptor
{

    intercept ( ccontex: ExecutionContextHost, next: CallHandler ): Observable<any>
    {
        return next
            .handle()
            .pipe(
                map( ( value ) =>
                {
                    // err res
                    if ( value.message )
                    {
                        const res = new PublicResponseDto()
                        res.status = StatusPublicResponseEnum.Error
                        res.payment_type = value.payment_type
                        res.message = value.message
                        return res
                    }

                    //success res
                    const res = new PublicResponseDto()
                    res.status = StatusPublicResponseEnum.Success
                    res.payment_type = value.payment_type
                    res.data = value.data
                    return res
                }
                )
            )
    }
} 