const { ECSClient, ListClustersCommand } = require("@aws-sdk/client-ecs");
const { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");


async function clusters(req, res) {
  try {
    const client = new ECSClient();
    const command = new ListClustersCommand(5);
    const response = await client.send(command);

    res.status(200).json({clusters: response.clusterArns})
  } catch (e) {
    res.status(400).json({error: "Make sure you have used the AWS cli to configure your access keys"})
  }
}

async function vpcs(req, res) {

}

//I need to create a policy in s3 to allow access to all objects in the bucket
/*
Bucket Policy:

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::<bucket-name>/*"
        }
    ]
}
*/

/*
Payload:
{
  "name": <appName>
}
*/

async function createBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const client = new S3Client();
  const command = new CreateBucketCommand({ Bucket: "cascade-" + req.body.name.toLowerCase() + "-" + id })
  const response = await client.send(command)

  res.status(200).json(response)
}

/*
Payload:
{
  "app": <appName>
  "env": <envName>
}
*/

async function addEnvironmentToBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const bucketParams = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}-environment.json`,
    Body: JSON.stringify({
      envName: req.body.env
    })
  }
  const client = new S3Client();
  const command = new PutObjectCommand(bucketParams);
  const response = await client.send(command);
  res.status(200).json(response)
}

/*
Needed info:
app name
*/

async function environment(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const s3Client = new S3Client();
  const bucketParams = {
    Bucket: "cascade-" + req.params.app.toLowerCase() + "-" + id,
    Key: `${req.params.env}-environment.json`,
  }

  try {
    // Create a helper function to convert a ReadableStream to a string.
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const response = await s3Client.send(new GetObjectCommand(bucketParams));

    // Convert the ReadableStream to a string.
    const bodyContents = await streamToString(response.Body);
    res.status(200).json(JSON.parse(bodyContents))
  } catch (err) {
    console.log("Error", err);
  }
}

module.exports = {
  clusters,
  createBucket,
  addEnvironmentToBucket,
  environment,
}
