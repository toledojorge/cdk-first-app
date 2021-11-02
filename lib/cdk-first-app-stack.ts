import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as path from 'path';

export class CdkFirstAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dynamodb table definition
    const greetingsTable = new dynamodb.Table(this, "GreetingsTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      }
    });

    // Lambda function
    const saveHelloFunction = new lambda.Function(this, "SaveHelloFunction",{
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.saveHello',
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')),
      environment: {
        GREETINGS_TABLE: greetingsTable.tableName
      }
    });

    const getHelloFunction = new lambda.Function(this, "GetHelloFunction",{
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler.getHello',
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')),
      environment: {
        GREETINGS_TABLE: greetingsTable.tableName
      }
    });

    // permissions to lambda to dynamo table
    greetingsTable.grantReadWriteData(saveHelloFunction);
    greetingsTable.grantReadData(getHelloFunction);

    // create THE API Gateway with one method and path
    const helloApi = new apigw.RestApi(this,"helloApi");

    helloApi.root
      .resourceForPath("hello")
      .addMethod("POST", new apigw.LambdaIntegration(saveHelloFunction));

    helloApi.root
      .resourceForPath("hello")
      .addMethod("GET", new apigw.LambdaIntegration(getHelloFunction));

  }
}
