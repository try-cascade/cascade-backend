export default function containerDefinitions(logGroupName: string, port: number, image: string, containerName: string, s3Arn: string) {
  return [
    {
      logConfiguration: {
        "logDriver": "awslogs",
        "secretOptions": null,
        "options": {
          "awslogs-group": logGroupName,
          "awslogs-region": "us-east-2",
          "awslogs-stream-prefix": "ecs",
        }
      },
      portMappings: [
        {
          "hostPort": port,
          "protocol": "tcp",
          "containerPort": port
        }
      ],
      command: null,
      cpu: 0,
      environmentFiles: [
        {
          "value": `${s3Arn}/.env`,
          "type": "s3"
        }
      ],
      image,
      dependsOn: [
        {
          "containerName": "cs-adot-collector-container",
          "condition": "START"
        }
      ],
      name: `cs-${containerName}-container`
    },
    {
      logConfiguration: {
        "logDriver": "awslogs",
        "secretOptions": null,
        "options": {
          "awslogs-group": logGroupName,
          "awslogs-region": "us-east-2",
          "awslogs-stream-prefix": "ecs",
        }
      },
      portMappings: [
        {
          "hostPort": 4317,
          "protocol": "tcp",
          "containerPort": 4317
        },
        {
          "hostPort": 55680,
          "protocol": "tcp",
          "containerPort": 55680
        },
        {
          "hostPort": 8888,
          "protocol": "tcp",
          "containerPort": 8888
        }
      ],
      command: [],
      cpu: 0,
      environmentFiles: [
        {
          "value": `${s3Arn}/.env`,
          "type": "s3"
        }
      ],
      image: "public.ecr.aws/aws-observability/aws-otel-collector:latest",
      name: "cs-adot-collector-container"
    }
  ];  
}

