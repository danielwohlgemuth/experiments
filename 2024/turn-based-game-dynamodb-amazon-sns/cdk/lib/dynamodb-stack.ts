import * as cdk from "aws-cdk-lib";
import {
  AttributeType,
  Billing,
  Capacity,
  ProjectionType,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoDBStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new TableV2(this, "DynamoDB", {
      tableName: "turn-based-game",
      partitionKey: {
        name: "gameId",
        type: AttributeType.STRING,
      },
      billing: Billing.provisioned({
        readCapacity: Capacity.fixed(5),
        writeCapacity: Capacity.autoscaled({ maxCapacity: 5 }),
      }),
      timeToLiveAttribute: "expireAt",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: "gsi-user1",
      partitionKey: {
        name: "user1",
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    });

    table.addGlobalSecondaryIndex({
      indexName: "gsi-user2",
      partitionKey: {
        name: "user2",
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    });
  }
}
