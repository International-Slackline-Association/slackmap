# SlackMap Server


## Undestanding the repository

Server-side resources lives entirely on AWS. It's a serverless application that uses AWS Lambda, API Gateway, DynamoDB, S3, etc. The server-side resources are written in Node.js and Typescript.

- [infrastucture](./infrastructure): The cloudformation templates for the server-side resources.
- [src](./src): The source code of the server-side resources. AWS Lambdas.

It is deployed using the [Serverless Framework](https://www.serverless.com/).

