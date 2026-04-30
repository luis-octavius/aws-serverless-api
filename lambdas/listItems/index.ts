import { docClient, TABLE_NAME} from "../shared/db";
import { buildErrorResponse, buildResponse } from "../shared/response";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME
        }));
        const items = result.Items ?? [];
        return buildResponse(200, items);
    } catch(error) {
        console.error(error);
        return buildErrorResponse(500, "Erro interno");
    }
}