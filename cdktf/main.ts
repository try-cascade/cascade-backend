import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
// import { EcsCluster } from "./resources/create_cluster"; // refactored and used createCluster instead

// import createVpc from './resources/create_vpc';
// import createInternetGateway from "./resources/create_internet_gateway";
// import createSubnet from "./resources/create_subnet";
// import createRouteTable from "./resources/create_route_table";
// import createRouteTableAssociation from "./resources/create_route_table_association";
// import createRoute from "./resources/create_route";
import createCluster from "./resources/create_cluster";
import createTaskDefinition from "./resources/create_task_definition";

// import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    new AwsProvider(this, "AWS", {
      region: "us-east-2",
    });

    // const aws_vpc = createVpc(this, "cascade")
    // const gateway = createInternetGateway(this, "cascade_gw", aws_vpc.id)

    // const pubSub1 = createSubnet(this, "cascade-public-1", aws_vpc.id, true, "us-east-1a", "10.0.1.0/24")
    // const pubSub2 = createSubnet(this, "cascade-public-2", aws_vpc.id, true, "us-east-1b", "10.0.2.0/24")

    // const table = createRouteTable(this, "cascade-table-1", aws_vpc.id)

    // createRouteTableAssociation(this, "cascade-sub-assoc-1", pubSub1.id, table.id)
    // createRouteTableAssociation(this, "cascade-sub-assoc-2", pubSub2.id, table.id)

    // createRoute(this, "cascade-route-1", table.id, gateway.id)

    // createSubnet(this, "cascade-private-1", aws_vpc.id, false, "us-east-1a", "10.0.3.0/24")
    // createSubnet(this, "cascade-private-2", aws_vpc.id, false, "us-east-1b", "10.0.4.0/24")

    // new SecurityGroup(this, "cascade-lb-security", {
    //   // This is a comment
    // })

    createCluster(this, "cascade-cluster")
    createTaskDefinition(this, "cascade-task-definition")
  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
