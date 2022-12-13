const { spawn } = require("child_process");
const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

function generate(req, res) {
  const child = spawn('cdktf synth', {
    stdio: 'inherit',
    shell: true,
    cwd: './cdktf'
  });

  child.on("close", (message) => {
    if (message === 0) {
      res.status(200).json({ message: "Successfully Built" });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  });
}

function deploy(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-control", "no-cache");

 var spw = spawn('cdktf deploy "*-stack" --auto-approve', {
   stdio: ['inherit', 'pipe'],
   shell: true,
   cwd: './cdktf'
 });

 spw.stdout.on('data', function (data) {
   res.write('data: ' + data.toString() + "\n\n");
 });

 spw.on('exit', function (code) {
     res.write('event: close\ndata: finished \n\n');
     res.end('exited');
 });

 spw.stderr.on('data', function (data) {
     res.end('stderr: ' + data);
 });
}

function destroy(req, res) {
  res.writeHead(200, { "Content-Type": "text/event-stream",
                        "Connection": "keep-alive",
                        "Cache-control": "no-cache" });

  var spw = spawn('cdktf destroy "*-stack" --auto-approve', {
    stdio: ['inherit', 'pipe'],
    shell: true,
    cwd: './cdktf'
  });

  spw.stdout.on('data', function (data) {
    res.write('data: ' + data.toString() + "\n\n");
  });

  spw.on('exit', function (code) {
    res.write('event: close\ndata: finished \n\n');
    res.end('exited');
  });

  spw.stderr.on('data', function (data) {
      res.end('stderr: ' + data);
  });
}

async function upload(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0];

  await uploadS3EnvStack(id, req);
  const response = await uploadS3ServicesStack(id, req);

  res.status(200).json(response);
}

async function uploadS3EnvStack(id, req) {
  const bucketParams = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/env-stack/cdk.tf.json`,
    Body: fs.createReadStream('./cdktf/cdktf.out/stacks/env-stack/cdk.tf.json'),
    ContentLength: fs.createReadStream('./cdktf/cdktf.out/stacks/env-stack/cdk.tf.json').byteCount // added
  };

  const client = new S3Client();
  const command = new PutObjectCommand(bucketParams);
  await client.send(command);
}

async function uploadS3ServicesStack(id, req) {
  const bucketParams = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/services-stack/cdk.tf.json`,
    Body: fs.createReadStream('./cdktf/cdktf.out/stacks/service-stack/cdk.tf.json')
  };

  const client = new S3Client();
  const command = new PutObjectCommand(bucketParams);
  const response = await client.send(command);
  return response;
}

module.exports = {
  generate,
  deploy,
  destroy,
  upload
};
