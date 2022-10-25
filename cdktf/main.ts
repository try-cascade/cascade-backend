import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

// env
import createVpc from './resources/create_vpc';
import createInternetGateway from "./resources/create_internet_gateway";
import createSubnet from "./resources/create_subnet";
import createRouteTable from "./resources/create_route_table";
import createRouteTableAssociation from "./resources/create_route_table_association";
import createRoute from "./resources/create_route";

// service
import createCluster from "./resources/create_cluster";
import createService from "./resources/create_ecs_service";
import createTaskDefinition from "./resources/create_task_definition";

import createALB from "./resources/create_app_load_balancer";
import createAlbTargetGroup from "./resources/create_alb_target_group";
import createAlbListener from "./resources/create_alb_listener";

import createSecurityGroup from "./resources/create_security_group";
import createAlbSecurityGroup from "./resources/create_alb_security_group";

import { Vpc } from '@cdktf/provider-aws/lib/vpc';
import { Subnet } from '@cdktf/provider-aws/lib/subnet';



class EnvironmentStack extends TerraformStack {
  public vpc: Vpc;
  public pubSub1: Subnet;
  public pubSub2: Subnet;
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "AWS", {
      region: "us-east-2", // grab it from .aws
    });

    this.vpc = createVpc(this, "cascade") // policy for creating vpc?
    const gateway = createInternetGateway(this, "cascade_gw", this.vpc.id)

    this.pubSub1 = createSubnet(this, "cascade-public-1", this.vpc.id, true, "us-east-2a", "172.31.0.0/20")
    this.pubSub2 = createSubnet(this, "cascade-public-2", this.vpc.id, true, "us-east-2b", "172.31.16.0/20")
    
    const table = createRouteTable(this, "cascade-table-1", this.vpc.id)

    createRouteTableAssociation(this, "cascade-sub-assoc-1", this.pubSub1.id, table.id)
    createRouteTableAssociation(this, "cascade-sub-assoc-2", this.pubSub2.id, table.id)

    createRoute(this, "cascade-route-1", table.id, gateway.id)

    // createSubnet(this, "cascade-private-1", aws_vpc.id, false, "us-east-1a", "10.0.3.0/24")
    // createSubnet(this, "cascade-private-2", aws_vpc.id, false, "us-east-1b", "10.0.4.0/24")
  }
}

interface ServiceStackConfig {
  vpcId: string;
  pubSubId1: string;
  pubSubId2: string;
}

class ServiceStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: ServiceStackConfig) {
    super(scope, name);

    const { vpcId, pubSubId1, pubSubId2 } = config;

    new AwsProvider(this, "AWS", {
      region: "us-east-2", // grab it from .aws
    });

    const securityGroup = createSecurityGroup(this, "cascade-security-group", vpcId);

    const lbSecurityGroup = createAlbSecurityGroup(this, "cascade-lb-security-group", vpcId);

    const appLoadBalancer = createALB(this, "cascade-lb", lbSecurityGroup.id, pubSubId1, pubSubId2);

    const albTargetGroup = createAlbTargetGroup(this, "cascade-target", vpcId);
  
    createAlbListener(this, "cascade-alb-listener", appLoadBalancer.arn, albTargetGroup.arn);

    const ourCluster = createCluster(this, "cascade-cluster");
    const ourTaskDefinition = createTaskDefinition(this, "cascade-task-definition");
    const clusterArn = ourCluster.arn;
    const taskDefinitionArn = ourTaskDefinition.arn;

    createService(this, "cascade-service", clusterArn, taskDefinitionArn, pubSubId1, pubSubId2, securityGroup.id, albTargetGroup.arn);
  }
}

const app = new App();
const env = new EnvironmentStack(app, "env-stack");
new ServiceStack(app, "service-stack", {
  vpcId: env.vpc.id,
  pubSubId1: env.pubSub1.id,
  pubSubId2: env.pubSub2.id,
});

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