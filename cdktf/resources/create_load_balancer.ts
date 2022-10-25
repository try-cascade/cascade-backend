import { Lb } from "@cdktf/provider-aws/lib/lb"

export default function createLB(scope: any, id: string, securityGroupId: string, subnet1: string, subnet2: string) {
  const loadBalancer = new Lb(scope, id, {
    name: "cascade-lb",
    loadBalancerType: "application",
    internal: false,
    securityGroups: [securityGroupId],
    subnets: [subnet1, subnet2]

  })

  return loadBalancer
}