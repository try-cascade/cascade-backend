import { EcsCluster as Cluster } from "@cdktf/provider-aws/lib/ecs-cluster"
import { Construct } from "constructs"

export class EcsCluster extends Construct {
  public cluster: Cluster

  constructor(
    scope: Construct,
    name: string
  ) {
    super(scope, name)

    this.cluster = new Cluster(this, "cluster", {
      name: `cdktf-cluster`,
    })
  }
}