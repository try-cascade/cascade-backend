import { IamRole } from "@cdktf/provider-aws/lib/iam-role"

export default function createExecutionRole(scope: any, name: string, s3Arn: string) {
  const executionRole = new IamRole(scope, name, {
    name,
    tags: {
      Name: name
    },
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
      {
        name: "allow-s3-access",
        policy: JSON.stringify({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "s3:GetObject"
              ],
              "Resource": [
                `${s3Arn}/.env` //"arn:aws:s3:::cascade-hello-bucket/.env"
              ]
            },
            {
              "Effect": "Allow",
              "Action": [
                "s3:GetBucketLocation"
              ],
              "Resource": [
                s3Arn //"arn:aws:s3:::cascade-hello-bucket"
              ]
            }
          ]
        })
      }
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