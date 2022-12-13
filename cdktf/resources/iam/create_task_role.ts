import { IamRole } from "@cdktf/provider-aws/lib/iam-role";

export default function createTaskRole(scope: any, name: string) {
  const taskRole = new IamRole(scope, name, {
    name,
    tags: {
      Name: name
    },
    inlinePolicy: [
      {
        name: "allow-logs",
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
              Resource: "*",
            },
          ],
        }),
      },
    ],
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: "sts:AssumeRole",
          Effect: "Allow",
          Sid: "",
          Principal: {
            Service: "ecs-tasks.amazonaws.com",
          },
        },
      ],
    }),
  });

  return taskRole;
}