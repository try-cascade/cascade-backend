
const { spawn } = require("child_process");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");

function create(req, res) {
  const child = spawn('cdktf synth', {
    stdio: 'inherit',
    shell: true,
    cwd: '../cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "Successfully Built" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })
}

function deploy(req, res) {
  const child = spawn('cdktf deploy --auto-approve', {
    stdio: 'inherit',
    shell: true,
    cwd: '../cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "infrastructure should now be seen in your AWS environment" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })
}

/*
Payload:
{
  "app": "name",
  "env": "name"
}
*/

async function uploadS3EnvironmentObject(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const bucketParams = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/env-stack/cdk.tf.json`,
    // Need to read from ../../cdktf/cdktf.out/stacks/env-stack/cdk.tf.json
    Body: JSON.stringify({
      envName: req.body.env
    })
  }
  const client = new S3Client();
  const command = new PutObjectCommand(bucketParams);
  const response = await client.send(command);
  res.status(200).json(response)
}

module.exports = {
  create,
  deploy,
  uploadS3EnvironmentObject
}
