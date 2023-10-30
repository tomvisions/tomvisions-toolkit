import { IAMClient, ListUsersCommand, DeleteRoleCommand, ListRolesCommand, CreateRoleCommand, DeletePolicyCommand, CreatePolicyCommand, AttachRolePolicyCommand, User, Policy, Role, ListAttachedRolePoliciesCommand, DetachRolePolicyCommand, ListAttachedUserPoliciesCommand, DeleteUserCommand, AttachedPolicy } from "@aws-sdk/client-iam";
import { timer, logger } from "./";

class IAM {
    private _client:IAMClient;

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
     * 
     * @param prefix Function which filters the the role list by prefix given
     * @param type 
     */
    private async filterRoleListByPrefix(prefix, params) : Promise<Role[]> {
            const roles = await this.listRoles(params);
            const data = roles.Roles.filter((role) => {
                 return role.RoleName.includes(prefix);
            });

            data['IsTruncated'] = roles.IsTruncated;
            data['Marker'] = roles.Marker;

            return data;
    }


    /**
     * Deletes role by prefix
     * @param prefix 
     */
    public async deleteRoleByPrefix(prefix: string) {

        logger.logMessage('Starting deleting process', null, 'INFO', 'Deleting Role by Prefix');   
      //  const roles = await this.listRoles(prefix);
        let searchPrefix = true;
        const params = {Token: null}
    
        while(searchPrefix) {
            const filteredListRole = await this.filterRoleListByPrefix(prefix, params);

            if (filteredListRole['IsTruncated']) {
                params.Token = filteredListRole['Marker'];
            } else {
                searchPrefix = false;
            }

            filteredListRole.map(async (role) => {
                (await this.listAttachedRolePolicies(role.RoleName)).map(async (policy:AttachedPolicy) => {
                    await this.detachPolicyFromRole(role.RoleName, policy.PolicyArn);
                }); 
                await this.deleteRole(role);        
            });
        }     
    }

    public async deleteUserByPrefix(prefix: string) {
        logger.logMessage('Starting deleting process', null, 'INFO', 'Deleting User by Prefix');   
     //   const user = await this.listUsers(prefix);
        (await this.listUsers(prefix)).map( async (user) => {
            (await this.listAttachedUserPolicies(user.UserName)).map(async (policy:Policy) => {
                await this.detachPolicyFromRole(user.UserName, policy.Arn)
            });

            await this.deleteUser(user);
        });
    }

    public async deletePolicyByPrefix(prefix: string) {

    }

    /**
     * Function that deletes the role
     * @param role Role
     * @returns 
     */
    private async deleteRole(role: Role) {
        try {
            const params = {
                RoleName : role.RoleName,
            };

            logger.logMessage('Delete Role with params:',params, 'INFO');
            return await this._client.send(new DeleteRoleCommand(params));

        } catch (error) {
            logger.logMessage('Error deleting Role wth error:',error,'ERROR');
            return error.toString();
        }

    }

    private async deleteUser(user:User) {
        try {
            const params = {
                UserName : user.UserName,
            };

            logger.logMessage('Delete User with params:',params, 'INFO');
            return await this._client.send(new DeleteUserCommand(params));

        } catch (error) {
            logger.logMessage('Create Role has error:',error, 'ERROR');
            return error.toString();
//            throw new Error(`Create Role has error: ${error.toString()}`);
        }
    }

    /**
     * List Roles 
     * @param prefix 
     * @returns 
     */
    private async listRoles(params = null) {
        try {
            logger.logMessage('List Roles with params:',params, 'INFO');
            return (await this._client.send(new ListRolesCommand(params)))
        } catch (error) {
            logger.logMessage(`Error listing Roles with params: ${error.toString}`,error, 'ERROR');
            return error.toString();
        }
    }

    private async listUsers(prefix:string) {
        try {
            const params = {
                PathPrefix : prefix,
            };

            logger.logMessage('List Users with params:',params, 'INFO');
            return (await this._client.send(new ListUsersCommand(params))).Users

        } catch (error) {
            throw new Error(`List Users has error: ${error.toString()}`);
        }
        
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

            return await this._client.send(new DeletePolicyCommand(params));

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
        logger.logMessage('About to start cleaning IAM user for ARN', {roleArn:role.Arn});
       // const rolePolicies = await this.listAttachedRolePolicies(role.RoleName);

        (await this.listAttachedRolePolicies(role.RoleName)).map(async (policies) => {
            await this.detachPolicyFromRole(role.RoleName, policies['PolicyArn'])
            await this.deletePolicy(policies['PolicyArn']);
        });        
     }
    
     /**
     * List attached Policies from Role
     * @param roleName
     * @returns 
     */
    private async listAttachedRolePolicies(roleName) : Promise<AttachedPolicy[]>{
        try { 
            const params = {
                "RoleName": roleName,
            }

            console.log('the params');
            console.log(params);
            logger.logMessage('Listing Attached Policies to Role', {
                "RoleName": roleName,
            }, 'INFO');
            
          //  console.log(await this._client.send(new ListAttachedRolePoliciesCommand(params)));
            return (await this._client.send(new ListAttachedRolePoliciesCommand(params))).AttachedPolicies;

        } catch (error) {
            logger.logMessage(error.toString, error, 'ERROR');
            throw new Error(error.toString());
        }
    }


     /**
     * List attached Policies from Role
     * @param roleName
     * @returns 
     */
     private async listAttachedUserPolicies(userName) : Promise<AttachedPolicy[]>{
        try {
            console.log('user name');
            console.log(userName );

            const params = {
                "UserName": userName,
            }

            console.log('the params');
            console.log(params);
            logger.logMessage('Listing Attached Policies to User', {
                "UserName": userName,
            }, 'INFO');
            
            return (await this._client.send(new ListAttachedUserPoliciesCommand(params))).AttachedPolicies;

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
            return  error.toString();
        }
    }
}
export const iam = new IAM();