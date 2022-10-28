// const { ECSClient, ListClustersCommand } = require("@aws-sdk/client-ecs");
const { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, ListBucketsCommand } = require("@aws-sdk/client-s3");

const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");

async function applications(req, res) {
  const s3Client = new S3Client();
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Success", data.Buckets);
    const applications = data.Buckets.filter(bucket => bucket.Name.startsWith('cascade'))

    res.status(200).json({applications}) // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}


// async function clusters(req, res) {
//   try {
//     const client = new ECSClient();
//     const command = new ListClustersCommand(5);
//     const response = await client.send(command);

//     res.status(200).json({clusters: response.clusterArns})
//   } catch (e) {
//     res.status(400).json({error: "Make sure you have used the AWS cli to configure your access keys"})
//   }
// }

// async function vpcs(req, res) {

// }


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
"AWS_ACCESS_KEY_ID=AKIA3SGCWF2BRQ2V3EXW",
  "AWS_REGION=us-east-2",
  "AWS_SECRET_ACCESS_KEY=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",
  "BUCKET=yueun-bucket-from-sdk"

Payload
{
  "app": "name"
  "env": "name"
  "accessKey": "key"
  "region": "region"
  "secretKey": "secret"
  "bucket": "bucketFromSdk"
}
*/

async function addEnvironmentToBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const env = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/.env`,
    Body: `AWS_ACCESS_KEY_ID=${req.body.accessKey}
    AWS_REGION=${req.body.region}
    AWS_SECRET_ACCESS_KEY=${req.body.secretKey}
    BUCKET=${req.body.bucket}`
  }

  const services = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/services.json`,
    Body: JSON.stringify({ containers: [], s3Arn: `arn:aws:s3:::cascade-${req.body.env}-${id}`})
  }

  const client = new S3Client();
  const createEnv = new PutObjectCommand(env);
  const createServices = new PutObjectCommand(services);
  await client.send(createEnv);
  await client.send(createServices);
  res.status(200).json({message: "Success"})
}

/*
Needed info:
app name
*/

// Realized that since we don't really have anything other than the name of the environment to go off it is weird to have a path to get the name, if we already have the name...
// async function environment(req, res) {
//   const user = new IAMClient();
//   const getUser = new GetUserCommand(user);
//   const userResponse = await user.send(getUser);

//   const id = userResponse.User.Arn.match(/\d+/)[0]

//   const s3Client = new S3Client();
//   const bucketParams = {async function clusters(req, res) {
//   try {
//     const client = new ECSClient();
//     const command = new ListClustersCommand(5);
//     const response = await client.send(command);

//     res.status(200).json({clusters: response.clusterArns})
//   } catch (e) {
//     res.status(400).json({error: "Make sure you have used the AWS cli to configure your access keys"})
//   }
// }

// async function vpcs(req, res) {

// }
//     // Create a helper function to convert a ReadableStream to a string.
//     const streamToString = (stream) =>
//       new Promise((resolve, reject) => {
//         const chunks = [];
//         stream.on("data", (chunk) => chunks.push(chunk));
//         stream.on("error", reject);
//         stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
//       });

//     // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
//     const response = await s3Client.send(new GetObjectCommand(bucketParams));

//     // Convert the ReadableStream to a string.
//     const bodyContents = await streamToString(response.Body);
//     res.status(200).json(JSON.parse(bodyContents))
//   } catch (err) {
//     console.log("Error", err);
//   }
// }

/*
Payload:
{
  "app": "name"
  "env": "name"
  "service": "name"
  "image": "path"
  "port": "3000"
  "type": "backend/frontend"
  "frontFacingPath": "path"
  "var": [
    "key=value",
  ]
}
*/

// When we create an environment, we also create a services.json file with an []

async function addServiceToBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]


  const s3Client = new S3Client();
  const bucketParams = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/services.json`,
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
    let bodyContents = await streamToString(response.Body);
    const client = new S3Client();

    const service = {
      name: req.body.service,
      port: req.body.port,
      image: req.body.image,
    }

    if (req.body.var) {
      service["s3Arn"] = `arn:aws:s3:::cascade-${req.body.app}-${id}/${req.body.env}/${req.body.service}/.env` // Only has this if there are .env vars

      const env = {
        Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
        Key: `${req.body.env}/${req.body.service}/.env`,
        Body: req.body.var.join("\n")
      }

      const addService = new PutObjectCommand(env);
      await client.send(addService);
    }

    bodyContents = JSON.parse(bodyContents)
    bodyContents.containers.push(service)

    const bucketInfo = {
      Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
      Key: `${req.body.env}/services.json`,
      Body: JSON.stringify(bodyContents)
    }

    const addService = new PutObjectCommand(bucketInfo);
    await client.send(addService);

    res.status(200).json({message: "Worked"})

  } catch (err) {
    console.log("Error", err);
  }
}

async function services(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const s3Client = new S3Client();

  const bucketParams = {
    Bucket: "cascade-" + req.params.app.toLowerCase() + "-" + id,
    Key: `${req.params.env}/services.json`,
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
  applications,
  // clusters,
  createBucket,
  addEnvironmentToBucket,
  // environment,
  addServiceToBucket,
  services
}
