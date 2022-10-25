import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

import createVpc from './resources/create_vpc';
import createInternetGateway from "./resources/create_internet_gateway";
import createSubnet from "./resources/create_subnet";
// import createVpcEndpoint from "./resources/create_vpc_endpoint";
import createRouteTable from "./resources/create_route_table";
import createRouteTableAssociation from "./resources/create_route_table_association";
import createRoute from "./resources/create_route";
import createCluster from "./resources/create_cluster";
import createLB from "./resources/create_load_balancer";
import createTargetGroup from "./resources/create_target_group";
import createService from "./resources/create_ecs_service";
import createTaskDefinition from "./resources/create_task_definition";
import createSecurityGroup from "./resources/create_security_group";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    new AwsProvider(this, "AWS", {
      region: "us-east-2",
    });

    const aws_vpc = createVpc(this, "cascade") // policy for creating vpc?
    const gateway = createInternetGateway(this, "cascade_gw", aws_vpc.id)

    const pubSub1 = createSubnet(this, "cascade-public-1", aws_vpc.id, true, "us-east-2a", "172.31.0.0/20")
    const pubSub2 = createSubnet(this, "cascade-public-2", aws_vpc.id, true, "us-east-2b", "172.31.16.0/20")

    // vpc endpoint (depends on subnet, which depends on vpc)
    // createVpcEndpoint(this, "cascade-ecr-endpoint", )
    
    
    const table = createRouteTable(this, "cascade-table-1", aws_vpc.id)

    createRouteTableAssociation(this, "cascade-sub-assoc-1", pubSub1.id, table.id)
    createRouteTableAssociation(this, "cascade-sub-assoc-2", pubSub2.id, table.id)

    createRoute(this, "cascade-route-1", table.id, gateway.id)

    // createSubnet(this, "cascade-private-1", aws_vpc.id, false, "us-east-1a", "10.0.3.0/24")
    // createSubnet(this, "cascade-private-2", aws_vpc.id, false, "us-east-1b", "10.0.4.0/24")

    // new SecurityGroup(this, "cascade-lb-security", {
    //   // This is a comment
    // })

    // create security group
    const securityGroup = createSecurityGroup(this, "cascade-security-group", aws_vpc.id);

    const loadBalancer = createLB(this, "cascade-lb", securityGroup.id, pubSub1.id, pubSub2.id)
    console.log(loadBalancer.dnsName);

    const targetGroup = createTargetGroup(this, "cascade-target", aws_vpc.id)

    const ourCluster = createCluster(this, "cascade-cluster")
    const ourTaskDefinition = createTaskDefinition(this, "cascade-task-definition")
    const clusterArn = ourCluster.arn;
    const taskDefinitionArn = ourTaskDefinition.arn;

    createService(this, "cascade-service", clusterArn, taskDefinitionArn, pubSub1.id, pubSub2.id, securityGroup.id, targetGroup.arn);
  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();

/*
const cascadeRole = iam.IamRole(this, "cascade_vpc_role",
        name="my-cascade-role",
        managed_policy_arns=[
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ],
        assume_role_policy="""{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "sts:AssumeRole",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Effect": "Allow",
                    "Sid": ""
                }
            ]
        }""",
        )

- create a role and attach policies
*/