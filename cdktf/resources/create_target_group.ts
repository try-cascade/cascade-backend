import { LbTargetGroup } from "@cdktf/provider-aws/lib/lb-target-group";

export default function createTargetGroup(scope: any, id: string, vpcId: string) {
  const targetGroup = new LbTargetGroup(scope, id, {
    vpcId,
    targetType: "ip",
    port: 80,
    protocol: "HTTP",
  })

  return targetGroup;
}