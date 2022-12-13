import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";

export default function createAlbSecurityGroup(scope: any, name: string, vpcId: string) {
  const securityGroup = new SecurityGroup(scope, name, {
      vpcId: vpcId,
      tags: {
        Name: name
      },
      ingress: [
        // allow HTTP traffic from everywhere
        {
          protocol: "TCP",
          fromPort: 80, // user-specific port
          toPort: 80,
          cidrBlocks: ["0.0.0.0/0"],
          ipv6CidrBlocks: ["::/0"],
        },
      ],
      egress: [
        // allow all traffic to every destination
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