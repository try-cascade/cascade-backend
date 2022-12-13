import { EcsCluster } from "@cdktf/provider-aws/lib/ecs-cluster";

export default function createCluster(scope: any, name: string) {
  const cluster = new EcsCluster(scope, name, {
    name,
    capacityProviders: ["FARGATE"],
    tags: {
      Name: name
    }
  });

  return cluster;
}