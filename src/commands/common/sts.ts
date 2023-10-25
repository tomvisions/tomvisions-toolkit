import { STSClient, GetCallerIdentityCommand, GetCallerIdentityResponse } from "@aws-sdk/client-sts";

class STS {
    private _client: STSClient;

    constructor() {
        const options = {
            version: "2014-11-01",
            region: "us-east-1"
        }

        this._client = new STSClient(options);
    }


    /**
     * Fucntion which gets caller identity
     * @returns 
     */
    public async getCallerIdentity() : Promise<GetCallerIdentityResponse>{
        try {
            const params = {};

            return await this._client.send(new GetCallerIdentityCommand(params))
        } catch (error) {
            return error.toString();
        }
    }
}

export const sts = new STS();