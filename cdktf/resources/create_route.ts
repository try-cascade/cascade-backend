import { Route } from '@cdktf/provider-aws/lib/route'

export default function createRoute(context: any, name: string, routeTableId: string, gatewayId: string) {
  return new Route(context, name, {
    routeTableId: routeTableId,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: gatewayId
  })
}