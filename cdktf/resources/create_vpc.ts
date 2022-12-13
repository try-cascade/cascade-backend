import { Vpc } from '@cdktf/provider-aws/lib/vpc';

export default function createVpc(scope: any, name: string) {
  const aws_vpc = new Vpc(scope, name, {
    cidrBlock: "172.31.0.0/16",
    instanceTenancy: "default",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
      Name: name
    }
  });

  return aws_vpc;
}

