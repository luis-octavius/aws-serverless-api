import { docClient, TABLE_NAME } from "../shared/db";
import { buildErrorResponse, buildResponse } from "../shared/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id;
    if (!id) {
        return buildErrorResponse(400, "Parâmetro inválido");
    }

    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        }));

        if (!result.Item) {
            return buildErrorResponse(404, "Não encontrado");
        }

        return buildResponse(200, result.Item);
    } catch(error) {
        console.error(error);
        return buildErrorResponse(500, "Erro interno");
    }
}