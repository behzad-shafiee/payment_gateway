import { ErrorStatusesResponseEnum } from "src/enum/error.status.response.enum"

export class ErrorResponseDto
{
    message: string

    messageKey: string

    status: ErrorStatusesResponseEnum

    details: Record<string, any> | Array<any>
}