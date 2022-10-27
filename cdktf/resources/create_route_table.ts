import { RouteTable } from '@cdktf/provider-aws/lib/route-table'

export default function createRouteTable(scope: any, name: string, vpcId: string) {
  return new RouteTable(scope, name, {
    vpcId: vpcId,
    tags: {
      Name: name
    }
  })
}