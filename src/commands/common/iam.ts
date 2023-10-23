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

    /**
     * Creating IAM role 
     * @param prefix
     * @param policyDocument 
     */
    public async createIAMRole(prefix, policyDocument) {
        const policy = await this.createPolicy(prefix, policyDocument);
        await this.createRole(prefix, policy);
        
    }

    private async createRole(prefix, policy) {
        
        try {
            const params = JSON.parse(`{
                Path: "/*",
                RoleName: "role-${prefix()}-${uuid.v4()}", // required
                AssumeRolePolicyDocument: "${policy}", // required
                Description: "temporary role created by tomvisions-toolkit",
                }`);

            return await this._client.send(new CreateRoleCommand(params))

        } catch (error) {
            return error.toString();
        }
    }

    private async createPolicy(prefix, policy) {
        try {
            const params = JSON.parse(`{ 
                PolicyName: "policy-${prefix()}-${uuid.v4()}", // required
                Path: "/",
                PolicyDocument: "${policy}", // required
                Description: "STRING_VALUE",
                Tags: [ // tagListType
                  { // Tag
                    Key: "STRING_VALUE", // required
                    Value: "STRING_VALUE", // required
                  },
                }`);

            return await this._client.send(new CreatePolicyCommand(params))

        } catch (error) {
            return error.toString();
        }

    }
}

export const iam = new IAM();