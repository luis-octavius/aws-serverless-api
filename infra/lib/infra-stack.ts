import * as cdk from 'aws-cdk-lib/core';
import * as path from 'path';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // criação da tabela DynamoDB
    const table = new Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // criação de todas as nodejsfunctions responsáveis pelas rotas e métodos
    const createItemFn = new NodejsFunction(this, 'CreateItemFunction', {
      entry: path.join(__dirname, '../../lambdas/createItem/index.ts'),
      projectRoot: path.join(__dirname, '../../'),
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: table.tableName }
    })

    const getItemFn = new NodejsFunction(this, 'GetItemFunction', {
      entry: path.join(__dirname, '../../lambdas/getItem/index.ts'),
      projectRoot: path.join(__dirname, '../../'),
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: table.tableName }
    });

    const updateItemFn = new NodejsFunction(this, 'UpdateItemFunction', {
      entry: path.join(__dirname, '../../lambdas/updateItem/index.ts'),
      projectRoot: path.join(__dirname, '../../'),
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: table.tableName }
    });

    const listItemsFn = new NodejsFunction(this, 'ListItemsFunction', {
      entry: path.join(__dirname, '../../lambdas/listItems/index.ts'),
      projectRoot: path.join(__dirname, '../../'),
      handler: 'handler', 
      runtime: Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: table.tableName }
    });

    const deleteItemFn = new NodejsFunction(this, 'DeleteItemFunction', {
      entry: path.join(__dirname, '../../lambdas/deleteItem/index.ts'),
      projectRoot: path.join(__dirname, '../../'),
      handler: 'handler', 
      runtime: Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: table.tableName }
    });

    // criação da api REST
    const api = new RestApi(this, 'ItemsApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
        allowHeaders: ['Content-Type']
      }
    });

    // permissão de leitura e escrita para cada lambda
    table.grantReadWriteData(createItemFn);
    table.grantReadWriteData(getItemFn);
    table.grantReadWriteData(listItemsFn);
    table.grantReadWriteData(updateItemFn);
    table.grantReadWriteData(deleteItemFn);

    // criação dos recursos da api
    const items = api.root.addResource('items');
    const resourceId = items.addResource('{id}');
    items.addMethod('POST', new LambdaIntegration(createItemFn));
    resourceId.addMethod('GET', new LambdaIntegration(getItemFn));
    items.addMethod('GET', new LambdaIntegration(listItemsFn));
    resourceId.addMethod('PUT', new LambdaIntegration(updateItemFn));
    resourceId.addMethod('DELETE', new LambdaIntegration(deleteItemFn));
  }
}
