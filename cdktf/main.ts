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
import createExecutionRole from "./resources/iam/create_execution_role";
import createTaskRole from "./resources/iam/create_task_role";
import createLogGroup from "./resources/create_log_group";

import { Vpc } from '@cdktf/provider-aws/lib/vpc';
import { Subnet } from '@cdktf/provider-aws/lib/subnet';

const dummyObj = {
  envName: "hello"
}

const envName = dummyObj.envName;

class EnvironmentStack extends TerraformStack {
  public vpc: Vpc;
  public pubSub1: Subnet;
  public pubSub2: Subnet;
  constructor(scope: Construct, name: string) {
    super(scope, name);
    
    new AwsProvider(this, "AWS");
    this.vpc = createVpc(this, `cs-${envName}-vpc`) // policy for creating vpc?
    const gateway = createInternetGateway(this, `cs-${envName}-internet-gateway`, this.vpc.id)

    this.pubSub1 = createSubnet(this, `cs-${envName}-public-1`, this.vpc.id, true, "us-east-2a", "172.31.0.0/20")
    this.pubSub2 = createSubnet(this, `cs-${envName}-public-2`, this.vpc.id, true, "us-east-2b", "172.31.16.0/20")
    
    const table = createRouteTable(this, `cs-${envName}-table-1`, this.vpc.id)

    createRouteTableAssociation(this, `cs-${envName}-sub-assoc-1`, this.pubSub1.id, table.id)
    createRouteTableAssociation(this, `cs-${envName}-sub-assoc-2`, this.pubSub2.id, table.id)

    createRoute(this, `cs-${envName}-route-1`, table.id, gateway.id)

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

    new AwsProvider(this, "AWS");

    const securityGroup = createSecurityGroup(this, `cs-${envName}-security-group`, vpcId);

    const lbSecurityGroup = createAlbSecurityGroup(this, `cs-${envName}-alb-security-group`, vpcId);

    const appLoadBalancer = createALB(this, `cs-${envName}-lb`, lbSecurityGroup.id, pubSubId1, pubSubId2);

    const albTargetGroup = createAlbTargetGroup(this, `cs-${envName}-target-group`, vpcId);
  
    createAlbListener(this, `cs-${envName}-alb-listener`, appLoadBalancer.arn, albTargetGroup.arn);

    const cluster = createCluster(this, `cs-${envName}-cluster`);
    const executionRole = createExecutionRole(this, `cs-${envName}-execution-role`); // name interpolated within
    const taskRole = createTaskRole(this, `cs-${envName}-task-role`); // name interpolated within
    const logGroup = createLogGroup(this, `ecs/cs-${envName}-loggroup`);

    const taskDefinition = createTaskDefinition(this, `cs-${envName}-task-definition`, executionRole.arn, taskRole.arn, logGroup.name);

    createService(this, `cs-${envName}-service`, cluster.arn, taskDefinition.arn, pubSubId1, pubSubId2, securityGroup.id, albTargetGroup.arn);
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