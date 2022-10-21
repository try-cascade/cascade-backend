import { Subnet } from '@cdktf/provider-aws/lib/subnet'

export default function createSubnet(context: any, name: string, vpcId: string, isPublic: boolean, region: string, cidr: string) {
  return new Subnet(context, name, {
    vpcId: vpcId,
    cidrBlock: cidr,
    availabilityZone: region,
    mapPublicIpOnLaunch: isPublic,
    tags: {
      Name: name
    }
  })
}