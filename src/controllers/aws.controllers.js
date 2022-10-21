const { ECSClient, ListClustersCommand } = require("@aws-sdk/client-ecs"); // CommonJS import

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

module.exports = {
  clusters
}
