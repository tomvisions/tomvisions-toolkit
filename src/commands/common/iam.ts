import { IAMClient, CreateRoleCommand, CreatePolicyCommand, AttachRolePolicyCommand, Policy, Role } from "@aws-sdk/client-iam";
import { timer, logger } from "./";

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
     * @param roleName
     * @param policyName
     * @param policyDocument 
     */
    public async createIAMRole(roleName, policyName, policyDocument, policyAssume) {
        await logger.logMessage('Creating IAM role process', null, 'INFO', 'IAM Role Creation'); 

        const policy: Policy = await this.createPolicy(policyName, policyDocument);
        const roleInstance: Role = await this.createRole(roleName, policyAssume);
        await this.attachRolePolicy(roleName, policy.Arn);  
        await timer.sleep(10000);  

        return roleInstance;
    
    }

    /**
     * Function that creates a role with a policy Assume Document
     * @param roleName 
     * @param policyAssume 
     * @returns Promise<Role>
     */
    private async createRole(roleName, policyAssume) : Promise<Role> {
        
        try {
            const params = {
                RoleName: roleName,
                AssumeRolePolicyDocument: policyAssume
            };

            logger.logMessage('Creating Role:', {roleName:roleName}, 'INFO'); 
            return (await this._client.send(new CreateRoleCommand(params))).Role

        } catch (error) {
            throw new Error(`Create Role has error: ${error.toString()}`);
        }
    }

    /**
     * Creates a policy based on Policy Name and Policy Document
     * @param policyName 
     * @param policyDocument 
     * @returns Policy
     */
    private async createPolicy(policyName, policyDocument) : Promise <Policy> {
        try {
            const params = { 
                "PolicyName" : policyName, 
                "PolicyDocument": policyDocument
                }
            
                logger.logMessage('Creating Policy for Role', {policyName:policyName}, 'INFO'); 

            return (await this._client.send(new CreatePolicyCommand(params))).Policy
    
        } catch (error) {
            throw new Error(error.toString());
        }

    }

    /**
     * Functions which attaches Policy to Role
     * @param roleName 
     * @param policyArn 
     * @returns 
     */
    private async attachRolePolicy(roleName:string, policyArn) : Promise<any>{
        try {
      
            const params = { 
                "RoleName" : roleName, 
                "PolicyArn": policyArn
                }
         
              return await this._client.send(new AttachRolePolicyCommand(params));   
//            return await this._client.send(new AttachRolePolicyCommand(params))
            
        } catch (error) {
            logger.logMessage(error.toString, error, 'ERROR');
            throw new Error(error.toString());
        }
    }
}

export const iam = new IAM();