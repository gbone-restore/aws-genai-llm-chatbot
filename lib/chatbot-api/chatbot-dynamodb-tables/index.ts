import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";

export interface ChatBotDynamoDBTablesProps {
  readonly retainOnDelete?: boolean;
  readonly kmsKey?: kms.Key;
}

export class ChatBotDynamoDBTables extends Construct {
  public readonly sessionsTable: dynamodb.Table;
  public readonly byUserIdIndex: string = "byUserId";

  constructor(scope: Construct, id: string, props: ChatBotDynamoDBTablesProps) {
    super(scope, id);

    // Create the sessions table with a partition key of USER#<UUID>
    // and a sort key of SK of SESSION#<Unique Session ID>>
    // No need to the global secondary index for this table
    const sessionsTable = new dynamodb.Table(this, "SessionTable", {
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: props.kmsKey
        ? dynamodb.TableEncryption.CUSTOMER_MANAGED
        : dynamodb.TableEncryption.AWS_MANAGED,
      encryptionKey: props.kmsKey,
      removalPolicy:
        props.retainOnDelete === true
          ? cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE
          : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.sessionsTable = sessionsTable;
  }
}
