import { IamRole } from "@cdktf/provider-aws/lib/iam-role"

// Role that allows us to push logs
export default function createTaskRole(scope: any, name: string) {
  const taskRole = new IamRole(scope, `${name}-task-role`, {
    name: `${name}-task-role`,
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