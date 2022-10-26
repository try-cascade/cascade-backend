import { IamRole } from "@cdktf/provider-aws/lib/iam-role"

export default function createExecutionRole(scope: any, name: string) {
  const executionRole = new IamRole(scope, `${name}-execution-role`, {
    name: `${name}-execution-role`,
    inlinePolicy: [
      {
        name: "allow-ecr-pull",
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              Resource: "*",
            },
          ],
        }),
      },
    ],
    // this role shall only be used by an ECS task
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

  return executionRole;
}