import { AlbTargetGroup } from "@cdktf/provider-aws/lib/alb-target-group";

export default function createAlbTargetGroup(scope: any, name: string, vpcId: string) {
  const targetGroup = new AlbTargetGroup(scope, name, {
    vpcId,
    tags: {
      Name: name
    },
    targetType: "ip",
    port: 80,
    protocol: "HTTP",
  });

  return targetGroup;
}