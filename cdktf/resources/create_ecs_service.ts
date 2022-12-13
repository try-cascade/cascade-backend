import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";

export default function createService(scope: any, name: string, clusterArn: string, taskDefinitionArn: string, subnet1: string, subnet2: string, securityGroup: string, targetGroupArn: string, envName: string, container: any) {
  const service = new EcsService(scope, name, {
    name: `cs-${envName}-ecs-service`,
    cluster: clusterArn,
    taskDefinition: taskDefinitionArn,
    launchType: "FARGATE",
    desiredCount: 1,
    networkConfiguration:  // required because of fargate
      {
        subnets: [subnet1, subnet2],
        assignPublicIp: true,
        securityGroups: [securityGroup]
      },
    loadBalancer: [
      {
        containerPort: container.port,
        containerName: `cs-${container.name}-container`,
        targetGroupArn,
      }
    ],
    tags: {
      Name: name
    }
  });

  return service;
}