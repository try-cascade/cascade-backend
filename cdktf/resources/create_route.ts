import { Route } from '@cdktf/provider-aws/lib/route'

export default function createRoute(scope: any, name: string, routeTableId: string, gatewayId: string) {
  return new Route(scope, name, {
    routeTableId: routeTableId,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: gatewayId
  })
}