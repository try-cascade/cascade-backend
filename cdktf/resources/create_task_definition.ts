import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import containerDefinitions from "./utils/containerDefinitions";

export default function createTaskDefinition(scope: any, name: string, executionRole: string, taskRole: string, logGroupName: string, containerArr: any, s3Arn: string) {
  const taskDefinition = new EcsTaskDefinition(scope, name, {
    family: name,
    memory: "1GB",
    cpu: "0.5vCPU",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: executionRole, // can pull ecr image (not used yet)
    taskRoleArn: taskRole, // can push logs to cloudwatch
    containerDefinitions: JSON.stringify(containerDefinitions(logGroupName, containerArr, s3Arn)),
    tags: {
      Name: name
    }
  })

  return taskDefinition;
}