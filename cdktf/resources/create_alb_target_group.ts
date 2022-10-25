import { AlbTargetGroup } from "@cdktf/provider-aws/lib/alb-target-group";

export default function createAlbTargetGroup(scope: any, id: string, vpcId: string) {
  const targetGroup = new AlbTargetGroup(scope, id, {
    vpcId,
    targetType: "ip",
    port: 80,
    protocol: "HTTP",
  })

  return targetGroup;
}