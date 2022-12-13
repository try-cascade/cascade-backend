import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import containerDefinitions from "./utils/container_definitions";

export default function createTaskDefinition(scope: any, name: string, executionRole: string, taskRole: string, logGroupName: string, containerArr: any, s3Arn: string, envName: string) {
  const taskDefinition = new EcsTaskDefinition(scope, name, {
    family: name,
    memory: "1GB",
    cpu: "0.5vCPU",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: executionRole, 
    taskRoleArn: taskRole, 
    containerDefinitions: JSON.stringify(containerDefinitions(logGroupName, containerArr, s3Arn, envName)),
    tags: {
      Name: name
    }
  });

  return taskDefinition;
}