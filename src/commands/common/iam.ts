import { IAMClient, CreateRoleCommand, CreatePolicyCommand } from "@aws-sdk/client-iam";
import * as uuid from 'uuid';

class IAM {
    private _client;

    constructor() {
        const options = {
            version: "latest",
            region: "us-east-1"
        }

        this._client = new IAMClient(options);
    }

    public async createIAMRole() {
        await this.createPolicy();
        await this.createRole();
        
        try {


            const params = JSON.parse(`{ 
                "ExportTaskIdentifier": "STRING_VALUE", // required
                "SourceArn": "STRING_VALUE", // required
                "S3BucketName": "${this._bucket}",
                "IamRoleArn": "STRING_VALUE", // required
                "KmsKeyId": "STRING_VALUE", // required
                "S3Prefix": "STRING_VALUE",
                "ExportOnly": [ 
                    "DBSnapshotIdentifier": "${snapshot.DBSnapshotIdentifier}",
                    "DBInstanceIdentifier": "${snapshot.DBInstanceIdentifier}"
                }`);

            return await this._client.send(new CreateRoleCommand(params))

        } catch (error) {
            return error.toString();
        }
    }

    private async createRole() {
        
        try {
            const params = JSON.parse(`{ 
                "ExportTaskIdentifier": "STRING_VALUE", // required
                "SourceArn": "STRING_VALUE", // required
                "S3BucketName": "${this._bucket}",
                "IamRoleArn": "STRING_VALUE", // required
                "KmsKeyId": "STRING_VALUE", // required
                "S3Prefix": "STRING_VALUE",
                "ExportOnly": [ 
                    "DBSnapshotIdentifier": "${snapshot.DBSnapshotIdentifier}",
                    "DBInstanceIdentifier": "${snapshot.DBInstanceIdentifier}"
                }`);

            return await this._client.send(new CreateRoleCommand(params))

        } catch (error) {
            return error.toString();
        }
    }

    private async createPolicy(policy) {
        try {
            const params = JSON.parse(`{ 
                PolicyName: "policy-${uuid.v4()}", // required
                Path: "/",
                PolicyDocument: "${policy}", // required
                Description: "STRING_VALUE",
                Tags: [ // tagListType
                  { // Tag
                    Key: "STRING_VALUE", // required
                    Value: "STRING_VALUE", // required
                  },
                }`);

            return await this._client.send(new CreateRoleCommand(params))

        } catch (error) {
            return error.toString();
        }

    }
}

export const iam = new IAM();