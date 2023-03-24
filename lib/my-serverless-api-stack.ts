import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MyServerlessApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myBucket = new cdk.aws_s3.Bucket(this, 'texts-bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
    const textCreateHandler = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'text-create',
      {
        timeout: cdk.Duration.seconds(5),
        memorySize: 1024,
        entry: 'code/text-create/index.ts',
        environment: {
          BUCKET_NAME: myBucket.bucketName,
        },
      }
    )
    myBucket.grantWrite(textCreateHandler)

    const textReadHandler = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'text-read',
      {
        timeout: cdk.Duration.seconds(5),
        memorySize: 1024,
        entry: 'code/text-read/index.ts',
        environment: {
          BUCKET_NAME: myBucket.bucketName,
        },
      }
    )
    myBucket.grantRead(textReadHandler)

    const textDeleteHandler = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'text-delete',
      {
        timeout: cdk.Duration.seconds(5),
        memorySize: 1024,
        entry: 'code/text-delete/index.ts',
        environment: {
          BUCKET_NAME: myBucket.bucketName,
        },
      }
    )
    myBucket.grantDelete(textDeleteHandler)

    const api = new cdk.aws_apigateway.RestApi(this, 'my-serverless-api')
    const texts = api.root.addResource('texts')
    texts.addMethod(
      'POST',
      new cdk.aws_apigateway.LambdaIntegration(textCreateHandler)
    )

    const text = texts.addResource('{id}')
    text.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(textReadHandler))
    text.addMethod(
      'DELETE',
      new cdk.aws_apigateway.LambdaIntegration(textDeleteHandler)
    )


    // example resource
  //   const queue = new sqs.Queue(this, 'MyServerlessApiQueue', {
  //     visibilityTimeout: cdk.Duration.seconds(300)
  //   });
  }
}
