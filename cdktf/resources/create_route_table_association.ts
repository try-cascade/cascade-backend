import { RouteTableAssociation } from '@cdktf/provider-aws/lib/route-table-association'

export default function createRouteTableAssociation(scope: any, name: string, subnetId: string, routeTableId: string) {
  return new RouteTableAssociation(scope, name, {
    subnetId: subnetId,
    routeTableId: routeTableId
  })
}