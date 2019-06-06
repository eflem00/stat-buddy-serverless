const aws = require('aws-sdk');

aws.config.update({ region: process.env.REGION });
const ddb = new aws.DynamoDB.DocumentClient();
const s3 = new aws.S3();

module.exports.export = async () => {
  // console.log(event.Records[0].Sns);
  try {
    const response = await ddb.query({
      TableName: 'Events',
      KeyConditionExpression: 'playerId = :playerId and #dateTime between :startDate and :endDate',
      ExpressionAttributeNames: {
        '#dateTime': 'dateTime',
      },
      ExpressionAttributeValues: {
        ':playerId': 8469521,
        ':startDate': '2017-10-03T23:11:24Z',
        ':endDate': '2017-10-0723:11:24Z',
      },
    }).promise();

    await s3.putObject({
      Body: JSON.stringify(response.Items),
      Bucket: 'stat-buddy-exports',
      Key: 'test3.json',
      ContentType: 'application/json',
    }).promise();
  } catch (ex) {
    console.log('Exception: ', ex);
  }
};
