import { Alb } from "@cdktf/provider-aws/lib/alb"

export default function createALB(scope: any, id: string, securityGroupId: string, subnet1: string, subnet2: string) {
  const loadBalancer = new Alb(scope, id, {
    name: "cascade-lb",
    loadBalancerType: "application",
    internal: false,
    securityGroups: [securityGroupId],
    subnets: [subnet1, subnet2]

  })

  return loadBalancer
}