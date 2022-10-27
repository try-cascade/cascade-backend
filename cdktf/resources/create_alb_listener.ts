import { AlbListener } from "@cdktf/provider-aws/lib/alb-listener";

export default function createAlbListener(scope: any, name: string, lb: string, targetGroup: string) {
  const albListener = new AlbListener(scope, name, {
    loadBalancerArn: lb,
    port: 80,
    protocol: "HTTP",
    defaultAction: [{
      type: "forward",
      targetGroupArn: targetGroup
    }],
    tags: {
      Name: name
    }
  })

  return albListener
}