import { AlbListener } from "@cdktf/provider-aws/lib/alb-listener";

export default function createAlbListener(scope: any, id: string, lb: string, targetGroup: string) {
  const albListener = new AlbListener(scope, id, {
    loadBalancerArn: lb,
    port: 80,
    protocol: "HTTP",
    defaultAction: [{
      type: "forward",
      targetGroupArn: targetGroup
    }]
  })

  return albListener
}