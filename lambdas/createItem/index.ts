import { docClient, TABLE_NAME } from "../shared/db";
import { buildErrorResponse, buildResponse } from "../shared/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    // validação do body
    if (!event.body) {
        return buildErrorResponse(400, "Body ausente");
    }

    let parsedBody; 
    try {
        parsedBody = JSON.parse(event.body);
    } catch(error) {
        console.error(error);
        return buildErrorResponse(400, "Body inválido");
    }

    try {
        const id = crypto.randomUUID();
        const item = {
            id: id, 
            // achata o body para o mesmo nível (root)
            ...parsedBody
        }
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }))

        return buildResponse(201, item);

    } catch(error) {
        console.error(error)
        return buildErrorResponse(500, "Erro interno");
    }
}