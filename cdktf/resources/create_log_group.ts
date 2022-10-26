import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group";

export default function createLogGroup(scope: any, name: string) {
  const logGroup = new CloudwatchLogGroup(scope, name, {
    name: `ecs/${name}-loggroup`,
    retentionInDays: 30,
  })

  return logGroup
}