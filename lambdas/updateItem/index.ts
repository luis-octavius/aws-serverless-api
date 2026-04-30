import { docClient, TABLE_NAME } from "../shared/db";
import { buildErrorResponse, buildResponse } from "../shared/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id;
    if (!id) {
        return buildErrorResponse(400, "ID ausente");
    }

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
        // verificar se o item existe na database 
        // UpdateCommand gera um novo item caso não exista
        const existing = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        }));

        if (!existing.Item) {
            return buildErrorResponse(404, "Não encontrado");
        }
        // construção dos valores que o update recebe 
        const fields = Object.keys(parsedBody);
        const updateExpression = "SET " + fields.map(f => `#${f} = :${f}`).join(", ");
        const expressionAttributeNames = Object.fromEntries(fields.map(f => [`#${f}`, f]));
        const expressionAttributeValues = Object.fromEntries(fields.map(f => [`:${f}`, parsedBody[f]]));
        const result = await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }));
        return buildResponse(200, result.Attributes ?? {});

    } catch(error) {
        console.error(error);
        return buildErrorResponse(500, "Erro interno");
    }
}