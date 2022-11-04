const { spawn } = require("child_process");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");
const { Upload } = require("@aws-sdk/lib-storage")
const { pipeline, PassThrough } = require('stream')

const fs = require('fs');

function create(req, res) {
  const child = spawn('cdktf synth', {
    stdio: 'inherit',
    shell: true,
    cwd: './cdktf'
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
  const child = spawn('cdktf deploy "*-stack" --auto-approve', {
    stdio: 'inherit',
    shell: true,
    cwd: './cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "infrastructure should now be seen in your AWS environment" })
    } else {
      res.status(400).json({ message: "Something went wrong" }) // might be nice to determine what might make this happen
    }
  })
}

function destroy(req, res) {
  const child = spawn('cdktf destroy "*-stack" --auto-approve', {
    stdio: 'inherit',
    shell: true,
    cwd: './cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "infrastructure should now be removed from your AWS environment" })
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

// backend: use the generate route to put the tf.json file to the bucket after synth
// UI: add support for editing the tf.json file
// - let user upload new tf.json
// push all versions to S3 (we want all copies as S3 supports versioning

async function upload(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  await uploadS3EnvStack(id, req)
  const response = await uploadS3ServicesStack(id, req)

  res.status(200).json(response)
}

async function uploadS3EnvStack(id, req) {
  const bucketParams = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/env-stack/cdk.tf.json`,
    Body: fs.createReadStream('./cdktf/cdktf.out/stacks/env-stack/cdk.tf.json')
  }

  const client = new S3Client();
  const command = new PutObjectCommand(bucketParams);
  await client.send(command);
}

async function uploadS3ServicesStack(id, req) {
  const bucketParams = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/services-stack/cdk.tf.json`,
    Body: fs.createReadStream('./cdktf/cdktf.out/stacks/service-stack/cdk.tf.json')
  }

  const client = new S3Client();
  const command = new PutObjectCommand(bucketParams);
  const response = await client.send(command);
  return response
}


module.exports = {
  create,
  deploy,
  destroy,
  upload
}
