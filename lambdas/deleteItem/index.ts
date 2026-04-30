import { docClient, TABLE_NAME } from "../shared/db";
import { buildErrorResponse, buildResponse } from "../shared/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id;
    if (!id) {
        return buildErrorResponse(400, "ID ausente");
    }

    try {
        const existing = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        }));
        if (!existing.Item) {
            return buildErrorResponse(404, "Não encontrado");
        }

        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        }));

        return buildResponse(200, { message: "Item deletado com sucesso"});
    } catch(error) {
        console.error(error);
        return buildErrorResponse(500, "Erro interno");
    }
}