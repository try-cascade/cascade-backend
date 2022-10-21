import { RouteTableAssociation } from '@cdktf/provider-aws/lib/route-table-association'

export default function createRouteTableAssociation(context: any, name: string, subnetId: string, routeTableId: string) {
  return new RouteTableAssociation(context, name, {
    subnetId: subnetId,
    routeTableId: routeTableId
  })
}