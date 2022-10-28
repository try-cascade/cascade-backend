import { EcsService } from "@cdktf/provider-aws/lib/ecs-service"

export default function createService(scope: any, name: string, clusterArn: string, taskDefinitionArn: string, subnet1: string, subnet2: string, securityGroup: string, targetGroupArn: string, envName: string, containerArr: any) {

  const containerObjs = containerArr.map((container: { port: number; name: string; }) => {
    return {
      containerPort: container.port,
      containerName: `cs-${container.name}-container`,
      targetGroupArn: targetGroupArn,
    }
  })

  const service = new EcsService(scope, name, {
    name: `cs-${envName}-ecs-service`,
    cluster: clusterArn, // replace this with the cluster arn
    taskDefinition: taskDefinitionArn, // replace this with the task-definition arn
    launchType: "FARGATE",
    desiredCount: 1,
    networkConfiguration:  // required because of fargate
      {
        subnets: [subnet1, subnet2],
        assignPublicIp: true,
        securityGroups: [securityGroup]
      },
    loadBalancer: [
      ...containerObjs
    ],
    tags: {
      Name: name
    }
  })

  return service;
}