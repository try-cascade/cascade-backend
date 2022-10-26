## commands
- `cdktf synth`
- `cdk deploy "*-stack" --auto-approve` OR `cdk deploy env-stack service-stack --auto-approve`
- `cdk destroy --auto-approve` OR `cdk destroy env-stack service-stack --auto-approve`

## Pre-requisites
- install AWS CLI
- set AWS user credentials via `aws configure` or on aws console
- give the user AmazonVPCFullAccess

## about stacks
- `service-stack` is dependent on `env-stack`
  -> must deploy both if deploying `service-stack`
  -> must also destroy `service-stack` if destroying `env-stack`