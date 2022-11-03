POST `/terraform/generate`

No payload expected

If status 200 is returned creates a json file in the cdktf directory based on user presets


POST `/terraform/deploy`

No payload expected

If status 200 is returned deploys the json terraform environment to AWS

POST `/aws/bucket`

payload:

{
  "name": "example-name"
}

If bad request, return 400
If success return 200

POST `/terraform/environment`

payload:

{
  "app": "name",
  "env": "name"
}

Note: dashes should be used between words

If bad request, return 400
If success return 200

POST `/terraform/service`

payload:

{
  port: 8080,
  image: “sample-docker/name”,
  environment: [
    {
      “name”: “SOME_NAME_OF_KEY”,
      “value”: “SOME_VALUE_TO_THE_KEY
    }
  ],
  containerName: “my-sample-container”
}
  - `port`: must be an integer
  - `image`: must be a string
  - `environment`: must be an array of 0+ objects
    - this is the environment variables required for your containerized app
    - each object has two k-v pairs
      - first key is “name”
      - second key is “value”
  - `containerName`: must be a string
    - this is the name of your docker container

If bad request, return 400
If success return 200