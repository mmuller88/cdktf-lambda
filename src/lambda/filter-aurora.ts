import { FirehoseTransformationEvent } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const kms = new AWS.KMS({ region: 'us-east-1' });

const { KMS_KEY = '', CLUSTER_ID = '' } = process.env;

interface DBRecord {
  key: string;
  databaseActivityEvents: string;
}

export async function handler(event: FirehoseTransformationEvent) {
  console.debug(`event: ${JSON.stringify(event)}`);

  const output = await Promise.all(
    [event.records[0]].map(async (record) => {
      const entry = Buffer.from(record.data, 'base64').toString('utf8');
      console.log('Entry: ', entry);

      const data = JSON.parse(entry) as DBRecord;

      const dataKeyDecoded = Buffer.from(data.key, 'base64').toString('utf8');

      const key = await kms.describeKey({ KeyId: KMS_KEY }).promise();
      console.debug(`key=${JSON.stringify(key)}`);

      const params: AWS.KMS.Types.DecryptRequest = {
        // CiphertextBlob: Buffer.from(record.data, 'base64'),
        CiphertextBlob: dataKeyDecoded,
        // KeyId: KMS_KEY,
        EncryptionContext: {
          'aws:rds:dbc-id': CLUSTER_ID,
          //   LambdaFunctionName: 'filter-aurora',
        },
      };
      console.log(`params=${JSON.stringify(params)}`);

      const dataDecrypted = await kms.decrypt(params).promise();
      console.log(`decrypted=${dataDecrypted.Plaintext?.toString()}`);

      return {
        recordId: record.recordId,
        result: 'Ok',
        data: record.data,
      };
    }),
  );

  console.log(`Processing completed.  Successful records ${output.length}.`);

  return { records: output };
}
