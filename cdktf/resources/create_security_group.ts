import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";

// pass in user app's port (currently hard-coded)
export default function createSecurityGroup(scope: any, name: string, vpcId: string) {
  const securityGroup = new SecurityGroup(scope, name, {
      vpcId: vpcId,
      tags: {
        Name: name
      },
      ingress: [
        // allow HTTP traffic from everywhere
        {
          protocol: "TCP",
          fromPort: 8080, // user-specific port
          toPort: 8080,
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