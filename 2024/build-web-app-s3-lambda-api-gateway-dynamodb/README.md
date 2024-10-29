# Build a Basic Web Application

This project follows the [Build a Basic Web Application](https://aws.amazon.com/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/) guide.

Arquitecture Diagram

![Basic Web Application Arquitecture Diagram](/2024/build-web-app-s3-lambda-api-gateway-dynamodb/assets/build-basic-app.png)

## Prerequisites:
- npm
- AWS Account

## Setup Dev Environment

```bash
npm install
npm run dev
```

Create a new Amplify app in AWS. Choose the appropriate repository, give it a name like `Basic Web Application`, and leave the remaining default options.

![Amplify Create New App](/2024/build-web-app-s3-lambda-api-gateway-dynamodb/assets/amplify-create-new-app.png)

Run `npx ampx sandbox` to create a environment in Amplify for development purposes.

If it fails with a credentials error, create an AWS access key, run `npx ampx configure profile` and enter the access key Id and secret.

Run the following command to update the graphql code after updating the data schema in [amplify/data/resource.ts](/2024/build-web-app-s3-lambda-api-gateway-dynamodb/amplify/data/resource.ts).

```bash
npx ampx generate graphql-client-code --out amplify/auth/post-confirmation/graphql
```

After deploying the app and signing up with a user, the following page shows up.

![Amplify App](/2024/build-web-app-s3-lambda-api-gateway-dynamodb/assets/amplify-app.png)

## Cleanup

Delete the sandbox with `npx ampx sandbox delete` and delete the Amplify app in AWS.
