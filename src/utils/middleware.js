const { S3Client, ListBucketsCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");

/*
Can we assume that the routes using this means they have an s3 bucket set up?

what we know is
  - the bucket name starts with 'cascade'
  - they can only have one bucket that matches this.
*/

async function getAppEnvNames(req, res, next) {
  try {
    const s3Client = new S3Client()
    const data = await s3Client.send(new ListBucketsCommand({}));
    const applications = data.Buckets.filter(bucket => bucket.Name.startsWith('cascade'))

    if (applications.length !== 0) req.app = applications[0].Name.match(/\-(.*?)\-/)[1]

    const s3Data = await s3Client.send(new ListObjectsCommand({ Bucket: applications[0].Name }));

    if (req.app) req.env = s3Data.Contents[0].Key.match(/(.*?)\//)[1]
    next()
  } catch(e) {
    console.log(e)
    res.status(500).json({ error: "AWS is not responding. Try again later." })
  }
}

module.exports = {
  getAppEnvNames
}

/*
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

*/