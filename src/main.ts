import { App, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import * as path from 'path';
import { Lambda } from './../.gen/modules/lambda';
import { NodejsFunction } from './constructs/nodejs-function';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const code = new NodejsFunction(this, 'code', {
      path: path.join(__dirname, 'lambda/filter-aurora.ts'),
    });

    new Lambda(this, 'FilterAuroraEventsLambda', {
      functionName: 'filter-aurora',
      handler: 'filter-aurora.handler',
      runtime: 'nodejs14.x',
      sourcePath: code.bundledPath,
      timeout: 15 * 60,
      attachPolicyStatements: true,
      policyStatements: {
        kms: {
          effect: 'Allow',
          actions: ['*'],
          resources: ['*'],
        },
        s3: {
          effect: 'Allow',
          actions: ['s3:*'],
          resources: ['*'],
        },
      },
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf-lambda');
app.synth();
