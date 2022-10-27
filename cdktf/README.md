## commands
- `cdktf synth`
- `cdktf deploy "*-stack" --auto-approve` OR `cdktf deploy env-stack service-stack --auto-approve`
- `cdktf destroy "*-stack" --auto-approve` OR `cdktf destroy env-stack service-stack --auto-approve`

## Pre-requisites
- install AWS CLI
- set AWS user credentials via `aws configure` or on aws console
- give the user AmazonVPCFullAccess

## about stacks
- `service-stack` is dependent on `env-stack`
  -> must deploy both if deploying `service-stack`
  -> must also destroy `service-stack` if destroying `env-stack`