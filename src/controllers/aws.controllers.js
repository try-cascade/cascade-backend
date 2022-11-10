// const { ECSClient, ListClustersCommand } = require("@aws-sdk/client-ecs");
const { EC2Client, DescribeVpcsCommand } = require("@aws-sdk/client-ec2"); 
const { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, ListBucketsCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");
const { ElasticLoadBalancingV2, DescribeLoadBalancersCommand } = require("@aws-sdk/client-elastic-load-balancing-v2");

const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");

let app = "0433"
let env = "0433-env";


async function applications(req, res) {
  const s3Client = new S3Client();
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    const applications = data.Buckets.filter(bucket => bucket.Name.startsWith('cascade'))

    // console.log(applications, "<--- applications applications")
    // console.log(applications[0].Name.match(/\-(.*?)\-/)[1], "<--- applications name")
    // if (applications) app = applications[0].Name.match(/\-(.*?)\-/)[1]

    // const s3Data = await s3Client.send(new ListObjectsCommand({ Bucket: applications[0].Name })); // ?
    // console.log(s3Data.Contents[0].Key.match(/(.*?)\//)[1], "<--- list objects command data");
    
    // if (app) env = s3Data.Contents[0].Key.match(/(.*?)\//)[1]

    // console.log(app, env, "<--- app and env")
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

async function vpc(req, res) {
  const input = {
    Filters: [
      {
        name: "tag",
        // value: { Name: `cs-${envName}-vpc` }
      }
    ]
  }
  const client = new EC2Client();
  const command = new DescribeVpcsCommand(input);
  try {
    const response = await client.send(command);

    const namedTag = response.Vpcs.filter(vpc => {
      if (!vpc.Tags) return
      return vpc.Tags.some(tag => {
        if (!tag.Value) return
        return tag.Value.startsWith('cs-') // Assumes our environments will always start with cs
      })
    })

    res.status(200).json({ vpc: namedTag[0] })
  } catch(e) {
    console.log(await e)
    res.status(200).json({ error: "not found" })
  }
}

async function website(req, res) {
  const client = new ElasticLoadBalancingV2();
  const command = new DescribeLoadBalancersCommand({ Names: [`cs-${env}-lb`]}); // get envName later
  try {
    const response = await client.send(command) // handle error
    const dnsName = response.LoadBalancers[0].DNSName;
    res.status(200).json({ url: `http://${dnsName}`})
  } catch(e) {
    res.status(200).json({ error: "not found" })
  }
}

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

  const id = userResponse.User.Arn.match(/\d+/)[0]; // we want the account id to be in the services.json
  app = req.body.name;

  const client = new S3Client();
  const command = new CreateBucketCommand({ Bucket: "cascade-" + app.toLowerCase() + "-" + id })
  const response = await client.send(command)

  res.status(200).json(response)
}

/*

Payload
{
  "app": "name"
  "env": "name"
  "accessKey": "key"
  "region": "region"
  "secretKey": "secret"
}
*/

async function addEnvironmentToBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const envVariables = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/.env`,
    Body: `AWS_ACCESS_KEY_ID=${req.body.accessKey}\nAWS_REGION=${req.body.region}\nAWS_SECRET_ACCESS_KEY=${req.body.secretKey}`
  }

  env = req.body.env;

  const services = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${env}/services.json`,
    Body: JSON.stringify({ envName: env, region: req.body.region, credentials: { accessKeyId: req.body.accessKey, secretAccessKey: req.body.secretKey }, containers: [], s3Arn: `arn:aws:s3:::cascade-${app}-${id}`})
  }

  const client = new S3Client();
  const createEnv = new PutObjectCommand(envVariables);
  const createServices = new PutObjectCommand(services);
  await client.send(createEnv);
  await client.send(createServices);
  res.status(200).json({message: "Success"})
}

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
    // Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Bucket: "cascade-" + req.body[0].app.toLowerCase() + "-" + id,
    Key: `${req.body[0].env}/services.json`,
  }

  console.log(req.body[0], "<--- from line 164")

  // {
  //   app: 'jk',
  //   env: 'rg',
  //   service: 'service',
  //   image: 'image',
  //   port: 3003,
  //   type: 'frontend',
  //   frontFacingPath: '/'
  // }

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

    // const service = { // we are getting an array of objects; we want n number of services (depending on the arr length)
    //   name: req.body.service,
    //   port: Number(req.body.port),
    //   image: req.body.image
    // }

    const services = req.body.map(serv => {
      return {
        name: serv.service,
        port: Number(serv.port),
        image: serv.image
      }
    });

    /*
    from Frontend
    const body = [{
      app: appName,
      env: envName,
      service: "service", // change back to `name`
      image: "image", // change back to image
      port: 3003, // change back to port
      type: "frontend",
      frontFacingPath: "/",
      // var: envVars.split(", ")
    }]
    */
    bodyContents = JSON.parse(bodyContents)
    console.log(bodyContents)
    for (let i = 0; i < req.body.length; i++) {
      console.log(req.body[i].var, "<--- req body's first var") // [""]
      if (req.body[i].var && req.body[i].var[0].length > 0) {
        services[i]["s3ArnEnv"] = `arn:aws:s3:::cascade-${req.body[i].app}-${id}/${req.body[i].env}/${req.body[i].service}/.env` // Only has this if there are .env vars
  
        const env = {
          Bucket: "cascade-" + req.body[i].app.toLowerCase() + "-" + id,
          Key: `${req.body[i].env}/${req.body[i].service}/.env`,
          Body: req.body[i].var.join("\n")
        }
  
        const addService = new PutObjectCommand(env);
        await client.send(addService);
      }

      bodyContents.containers.push(services[i])
    }

    
    // -- support multiple body objs (from welcome)
    // bodyContents.containers = services
    
    // -- support multiple body objs (from welcome) + adding an array of one body obj
    // if (bodyContents.containers === undefined) {
    //   bodyContents.containers = services
    // } else {
    //   bodyContents.containers = [...bodyContents.containers, ...services] // adding to existing containers property
    // }
    
    // -- support one body obj
    // bodyContents.containers.push(service)

    const bucketInfo = {
      Bucket: "cascade-" + req.body[0].app.toLowerCase() + "-" + id,
      Key: `${req.body[0].env}/services.json`,
      Body: JSON.stringify(bodyContents) // how to modify the existing object's body?
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
    Bucket: "cascade-" + app.toLowerCase() + "-" + id,
    Key: `${env}/services.json`,
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

async function terraform(req, res) {
  // create a route to find the app name and env name later
  let app = "cat"
  let env = "test"

  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0]

  const s3Client = new S3Client();

  const envStack = {
    Bucket: "cascade-" + app.toLowerCase() + "-" + id,
    Key: `${env}/env-stack/cdk.tf.json`,
  }

  const serviceStack = {
    Bucket: "cascade-" + app.toLowerCase() + "-" + id,
    Key: `${env}/services-stack/cdk.tf.json`,
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
    let environment = await s3Client.send(new GetObjectCommand(envStack));
    let services = await s3Client.send(new GetObjectCommand(serviceStack));

    environment = await streamToString(environment.Body)
    services = await streamToString(services.Body)

    environment = JSON.parse(environment)
    services = JSON.parse(services)

    res.status(200).json({ environment, services })
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
  services,
  website,
  terraform,
  vpc
}
