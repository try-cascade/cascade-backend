import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import { containerDefinitions } from "../secret/containerDefinitions";

export default function createTaskDefinition(scope: any, name: string, executionRole: string, taskRole: string) {
  const taskDefinition = new EcsTaskDefinition(scope, name, {
    family: "yk-adot-app-task",
    memory: "1GB",
    cpu: "0.5vCPU",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: executionRole, // can pull ecr image
    taskRoleArn: taskRole, // can push logs to cloudwatch
    containerDefinitions: JSON.stringify(containerDefinitions)
  })

  return taskDefinition;
}