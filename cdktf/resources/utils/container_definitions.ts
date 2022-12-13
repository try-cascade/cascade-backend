export default function containerDefinitions(logGroupName: string, containerArr: any, s3Arn: string, envName: string) {
  const containerObjs = containerArr.map((container: { port: number, image: string, s3ArnEnv: string, name: string }) => {
    return {
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
          "hostPort": container.port,
          "protocol": "tcp",
          "containerPort": container.port
        }
      ],
      command: null,
      cpu: 0,
      environmentFiles: [
        {
          "value": container.s3ArnEnv,
          "type": "s3"
        }
      ],
      image: container.image,
      dependsOn: [
        {
          "containerName": "cs-adot-collector-container",
          "condition": "START"
        }
      ],
      name: `cs-${container.name}-container`
    }
  })
  return [
    ...containerObjs,
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
          "value": `${s3Arn}/${envName}/.env`,
          "type": "s3"
        }
      ],
      image: "public.ecr.aws/aws-observability/aws-otel-collector:latest",
      name: "cs-adot-collector-container"
    }
  ];  
}

