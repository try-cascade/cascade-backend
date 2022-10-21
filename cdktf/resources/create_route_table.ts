import { RouteTable } from '@cdktf/provider-aws/lib/route-table'

export default function createRouteTable(context: any, name: string, vpcId: string) {
  return new RouteTable(context, name, {
    vpcId: vpcId,
    tags: {
      Name: name
    }
  })
}