import { InternetGateway } from '@cdktf/provider-aws/lib/internet-gateway'

export default function createInternetGateway(context: any, name: string, vpcId: string) {
  const gateway = new InternetGateway(context, name, {
    vpcId: vpcId,
    tags: {
      Name: name
    }
  })

  return gateway
}