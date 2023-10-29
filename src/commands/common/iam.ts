import { IAMClient, CreateRoleCommand, DeletePolicyCommand, CreatePolicyCommand, AttachRolePolicyCommand, Policy, Role, ListAttachedRolePoliciesCommand, DetachRolePolicyCommand, ListAttachedRolePoliciesCommandOutput } from "@aws-sdk/client-iam";
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

        logger.logMessage('IAM Role Created', null, 'INFO');   
        
        await timer.sleep(10000);

        return roleInstance;

    }

    /**
     * Function that creates a role with a policy Assume Document
     * @param roleName 
     * @param policyAssume 
     * @returns Promise<Role>
     */
    private async createRole(roleName, policyAssume): Promise<Role> {

        try {
            const params = {
                RoleName: roleName,
                AssumeRolePolicyDocument: policyAssume
            };

            logger.logMessage('Creating Role:', { roleName: roleName }, 'INFO');
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
    private async createPolicy(policyName, policyDocument): Promise<Policy> {
        try {
            const params = {
                "PolicyName": policyName,
                "PolicyDocument": policyDocument
            }

            logger.logMessage('Creating Policy for Role', { policyName: policyName }, 'INFO');

            return (await this._client.send(new CreatePolicyCommand(params))).Policy

        } catch (error) {
            throw new Error(error.toString());
        }
    }

    /**
     * Function to delete policy based on PolicyArn
     * @param policyArn string
     * @returns 
     */
    private async deletePolicy(policyArn: string) {
        try {
            const params = {
                PolicyArn: policyArn,
            }

            logger.logMessage('Deleting policy with with pararms', { policyArn: policyArn }, 'INFO');

            return (await this._client.send(new DeletePolicyCommand(params))).Policy

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
    private async attachRolePolicy(roleName: string, policyArn): Promise<any> {
        try {

            const params = {
                "RoleName": roleName,
                "PolicyArn": policyArn
            }

            logger.logMessage('Attaching policy to role', null, 'INFO');
            
            return await this._client.send(new AttachRolePolicyCommand(params));

        } catch (error) {
            logger.logMessage(error.toString, error, 'ERROR');
            throw new Error(error.toString());
        }
    }

    /**
     * Clean up function for roleArn with Policy Attached
     * @param iamRole
     */
    public async cleanUpRole(role:Role) {
        console.log('the role');
        console.log(role);
        logger.logMessage('About to start cleaning IAM role for ARN', {roleArn:role.Arn});
       // const rolePolicies = await this.listAttachedRolePolicies(role.RoleName);

        (await this.listAttachedRolePolicies(role.RoleName)).map(async (policies) => {
        //    this.detachPolicyFromRole(role.RoleName, policies)
        console.log('the policies');
            await this.detachPolicyFromRole(role.RoleName, policies['PolicyArn'])
            await this.deletePolicy(policies['PolicyArn']);
        });        
     }

    /**
     * List attached Policies from Role
     * @param roleName
     * @returns 
     */
    private async listAttachedRolePolicies(roleName) : Promise<ListAttachedRolePoliciesCommandOutput[]>{
        try {
            console.log('role name');
            console.log(roleName );

            const params = {
                "RoleName": roleName,
            }

            console.log('the params');
            console.log(params);
            logger.logMessage('Listing Attached Policies to Role', {
                "RoleName": roleName,
            }, 'INFO');


            
            return (await this._client.send(new ListAttachedRolePoliciesCommand(params))).AttachedPolicies;

        } catch (error) {
            logger.logMessage(error.toString, error, 'ERROR');
            throw new Error(error.toString());
        }
    }

    private async detachPolicyFromRole(roleName, policyArn) {

        try {
            const params = {
                 RoleName: roleName, 
                    PolicyArn: policyArn   
            }          

            logger.logMessage('Detaching Policy from Role', {
                "RoleName": roleName,
                "PolicyAr": policyArn
            }, 'INFO');


            
            return await this._client.send(new DetachRolePolicyCommand(params));

        } catch (error) {
            logger.logMessage(error.toString, error, 'ERROR');
            throw new Error(error.toString());
        }
    }
}
export const iam = new IAM();