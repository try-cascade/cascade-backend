import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";

// pass in user app's port (currently hard-coded)
export default function createSecurityGroup(scope: any, name: string, vpcId: string, container: any) {

  // const containerObjs = containerArr.map((container: { port: number }) => {
    // return {
    //   protocol: "TCP",
    //   fromPort: container.port, // user-specific port
    //   toPort: container.port,
    //   cidrBlocks: ["0.0.0.0/0"],
    //   ipv6CidrBlocks: ["::/0"],
    // }
  // })

  const securityGroup = new SecurityGroup(scope, name, {
    vpcId: vpcId,
    tags: {
      Name: name
    },
    ingress: [
      {
        protocol: "TCP",
        fromPort: container.port, // user-specific port
        toPort: container.port,
        cidrBlocks: ["0.0.0.0/0"],
        ipv6CidrBlocks: ["::/0"],
      }
    ],
    egress: [
      {
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        cidrBlocks: ["0.0.0.0/0"],
        ipv6CidrBlocks: ["::/0"],
      },
    ],
  });

  return securityGroup;
}