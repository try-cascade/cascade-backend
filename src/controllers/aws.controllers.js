const { ECSClient, ListClustersCommand } = require("@aws-sdk/client-ecs");
const { S3Client, CreateBucketCommand } = require("@aws-sdk/client-s3");

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

async function createBucket(req, res) {

  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]
  // console.log(userResponse)

  const client = new S3Client();
  const command = new CreateBucketCommand({ Bucket: "cascade-" + req.body.name.toLowerCase() + "-" + id })
  const response = await client.send(command)

  res.status(200).json(response)
}

module.exports = {
  clusters,
  createBucket
}
