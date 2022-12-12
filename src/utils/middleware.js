const { S3Client, ListBucketsCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");

async function getAppEnvNames(req, res, next) {
  try {
    const s3Client = new S3Client();
    const data = await s3Client.send(new ListBucketsCommand({}));
    const applications = data.Buckets.filter(bucket => bucket.Name.startsWith('cascade'));

    if (applications.length !== 0) {
      req.app = applications[0].Name.match(/\-(.*?)\-/)[1];
      let s3Data = await s3Client.send(new ListObjectsCommand({ Bucket: applications[0].Name }));
      req.env = s3Data.Contents[0].Key.match(/(.*?)\//)[1];
    }

    next();
  } catch(e) {
    res.status(500).json({ error: "AWS is not responding. Try again later." });
  }
}

module.exports = {
  getAppEnvNames
}