import { InternetGateway } from '@cdktf/provider-aws/lib/internet-gateway';

export default function createInternetGateway(scope: any, name: string, vpcId: string) {
  const gateway = new InternetGateway(scope, name, {
    vpcId: vpcId,
    tags: {
      Name: name
    }
  });

  return gateway;
}