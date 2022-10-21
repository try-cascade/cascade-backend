import { Vpc } from '@cdktf/provider-aws/lib/vpc'

export default function createVpc(context: any, name: string) {
  const aws_vpc = new Vpc(context, name, {
    cidrBlock: "10.0.0.0/16",
    instanceTenancy: "default",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
      Name: name
    }
  })

  return aws_vpc
}

