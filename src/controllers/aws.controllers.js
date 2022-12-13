const { EC2Client, DescribeVpcsCommand } = require("@aws-sdk/client-ec2"); 
const { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { ElasticLoadBalancingV2, DescribeLoadBalancersCommand } = require("@aws-sdk/client-elastic-load-balancing-v2");
const { IAMClient, GetUserCommand } = require("@aws-sdk/client-iam");

async function applications(req, res) {
  try {
    let applications;
    if (req.app && req.env) {
      applications = [{}];
    } else {
      applications = [];
    }

    res.status(200).json({ applications });
  } catch (err) {
    console.log("Error", err);
  }
}

async function vpc(req, res) {
  const input = {
    Filters: [
      {
        name: "tag"
      }
    ]
  };
  const client = new EC2Client();
  const command = new DescribeVpcsCommand(input);

  try {
    const response = await client.send(command);

    const namedTag = response.Vpcs.filter(vpc => {
      if (!vpc.Tags) return;
      return vpc.Tags.some(tag => {
        if (!tag.Value) return;
        return tag.Value.startsWith('cs-');
      })
    })

    res.status(200).json({ vpc: namedTag[0] });
  } catch(e) {
    res.status(200).json({ error: "not found" });
  }
}

async function website(req, res) {
  const client = new ElasticLoadBalancingV2();
  const command = new DescribeLoadBalancersCommand({ Names: [`cs-${req.env}-lb`]});
  try {
    const response = await client.send(command);
    const dnsName = response.LoadBalancers[0].DNSName;
    res.status(200).json({ url: `http://${dnsName}`});
  } catch(e) {
    res.status(200).json({ error: "not found" });
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

  const id = userResponse.User.Arn.match(/\d+/)[0];
  let app = req.body.name;

  const client = new S3Client();
  const command = new CreateBucketCommand({ Bucket: "cascade-" + app.toLowerCase() + "-" + id });
  const response = await client.send(command);

  res.status(200).json(response);
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

  const id = userResponse.User.Arn.match(/\d+/)[0];

  const envVariables = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${req.body.env}/.env`,
    Body: `AWS_ACCESS_KEY_ID=${req.body.accessKey}\nAWS_REGION=${req.body.region}\nAWS_SECRET_ACCESS_KEY=${req.body.secretKey}`
  };

  let env = req.body.env;

  const services = {
    Bucket: "cascade-" + req.body.app.toLowerCase() + "-" + id,
    Key: `${env}/services.json`,
    Body: JSON.stringify({ appName: req.body.app, envName: env, region: req.body.region, credentials: { accessKeyId: req.body.accessKey, secretAccessKey: req.body.secretKey }, containers: [], s3Arn: `arn:aws:s3:::cascade-${req.body.app}-${id}`})
  };

  const client = new S3Client();
  const createEnv = new PutObjectCommand(envVariables);
  const createServices = new PutObjectCommand(services);
  await client.send(createEnv);
  await client.send(createServices);
  res.status(200).json({ message: "Success" });
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

async function addServiceToBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);
  const id = userResponse.User.Arn.match(/\d+/)[0];
  const s3Client = new S3Client();
  const bucketParams = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/services.json`,
  };

  try {
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    const response = await s3Client.send(new GetObjectCommand(bucketParams));

    let bodyContents = await streamToString(response.Body);
    const client = new S3Client();
    const services = req.body.map(serv => {
      return {
        name: serv.service,
        port: Number(serv.port),
        image: serv.image
      }
    });

    bodyContents = JSON.parse(bodyContents);

    for (let i = 0; i < req.body.length; i++) {
      if (req.body[i].var && req.body[i].var[0].length > 0) {
        services[i]["s3ArnEnv"] = `arn:aws:s3:::cascade-${req.app}-${id}/${req.env}/${req.body[i].service}/.env`; 
  
        const env = {
          Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
          Key: `${req.env}/${req.body[i].service}/.env`,
          Body: req.body[i].var.join("\n")
        };
  
        const addService = new PutObjectCommand(env);
        await client.send(addService);
      }

      bodyContents.containers.push(services[i]);
    }

    const bucketInfo = {
      Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
      Key: `${req.env}/services.json`,
      Body: JSON.stringify(bodyContents)
    };

    const addService = new PutObjectCommand(bucketInfo);
    await client.send(addService);

    res.status(200).json({message: "Worked"});
  } catch (err) {
    console.log("Error", err);
  }
}

async function services(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0];

  const s3Client = new S3Client();

  const bucketParams = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/services.json`,
  };

  try {
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    const response = await s3Client.send(new GetObjectCommand(bucketParams));

    const bodyContents = await streamToString(response.Body);
    res.status(200).json(JSON.parse(bodyContents));
  } catch (err) {
    console.log("Error", err);
  }
}

async function terraform(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0];

  const s3Client = new S3Client();

  const envStack = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/env-stack/cdk.tf.json`,
  };

  const serviceStack = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/services-stack/cdk.tf.json`,
  };

  try {
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    let environment = await s3Client.send(new GetObjectCommand(envStack));
    let services = await s3Client.send(new GetObjectCommand(serviceStack));

    environment = await streamToString(environment.Body);
    services = await streamToString(services.Body);

    environment = JSON.parse(environment);
    services = JSON.parse(services);

    res.status(200).json({ environment, services });
  } catch (err) {
    console.log("Error", err);
  }
}

async function removeServiceFromBucket(req, res) {
  const user = new IAMClient();
  const getUser = new GetUserCommand(user);
  const userResponse = await user.send(getUser);

  const id = userResponse.User.Arn.match(/\d+/)[0];

  const s3Client = new S3Client();

  const servicesLocation = {
    Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
    Key: `${req.env}/services.json`,
  };

  try {
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    let services = await s3Client.send(new GetObjectCommand(servicesLocation));
    services = await streamToString(services.Body);
    services = JSON.parse(services);

    services.containers = services.containers.filter(service => service.name !== req.params.name);

    const bucketInfo = {
      Bucket: "cascade-" + req.app.toLowerCase() + "-" + id,
      Key: `${req.env}/services.json`,
      Body: JSON.stringify(services)
    };

    const modifyService = new PutObjectCommand(bucketInfo);
    await s3Client.send(modifyService);

    res.status(200).json({ services });
  } catch (err) {
    console.log("Error", err);
  }
}

module.exports = {
  applications,
  createBucket,
  addEnvironmentToBucket,
  addServiceToBucket,
  services,
  website,
  terraform,
  vpc,
  removeServiceFromBucket
};
