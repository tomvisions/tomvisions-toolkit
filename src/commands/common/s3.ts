import { S3Client, ListObjectsCommand, PutObjectCommand, ListBucketsCommand, ListBucketsCommandOutput } from "@aws-sdk/client-s3";
import fs from "fs";


export interface putObjectParams {
    Bucket: string,
    Key: string,
    ContentType: string,
    Body: any
};

export interface ListObjectsParams {
    Bucket: string,
    Prefix: string,
    Marker: null | string
}


class S3 {
    private _client;
    private _UPLOAD_BUCKET: string = 'tomvisions-original-images';
    // private _TARGET_FOLDER: string = 'photo-camera-gallery';

    constructor() {
        const options = {
            version: "latest",
            region: "us-east-1"
        }

        this._client = new S3Client(options);
    }

    /**
     * Function that lists all the objects 
     * @param params 
     * @returns 
     */
    private async listObjectsV2(params: ListObjectsParams) {
        try {
            return await this._client.send(new ListObjectsCommand(params));
        } catch (error) {
            return error.toString();
        }

    }

    /**
     * Delete buckets based on prefix
     * @param prefix 
     */
    public async deleteBucketBasedOnPrefix(prefix) {
        const bucketList = await this.listBuckets()
        bucketList.map(async (bucket) => {
            if (bucket.Name.includes(prefix)) {
                await this.retrieveObjectsNamesFromBucket(bucket.Name, '*');
            }
        })
    }



    /**
     * Listing the buckets 
     * @returns 
     */
    private async listBuckets() : Promise<ListBucketsCommandOutput["Buckets"]> {
        try {
            const params = {}
            return (await this._client.send(new ListBucketsCommand(params))).Buckets;
        } catch (error) {
            return error.toString();
        }

    }

    /**
     * Function to retrieve list of objects with specific prefix from specific bucket
     * @param bucket
     * @param prefix
     */
    public async retrieveObjectsNamesFromBucket(bucket: string, prefix: string) {

    try {
        const params: ListObjectsParams = {
            Bucket: bucket,
            Prefix: prefix,
            Marker: null
        }
        console.log(params);
        let retievingFiles = true;
        while(retievingFiles) {
            const results = await this.listObjectsV2(params);
            console.log(results);
            process.exit(0)
        }

    } catch (error) {
        return error.toString();
    }

}

    async listObjectsCommand() {

}


    /**
     * Function to retrieve list of objects with specific prefix from specific bucket
     * @param bucket
     * @param key
     * @returns {Promise<unknown>}
     */
    async uploadObjectsToBucket(bucket: string, key: string) {
    try {
        const fileStream = fs.createReadStream(`/tmp/${key}`);
        let params: putObjectParams = {
            Bucket: this._UPLOAD_BUCKET,
            Key: key,
            ContentType: 'image/jpeg',
            Body: fileStream
        };

        const putObjectsCommand = new PutObjectCommand(params);
        this._client.send(putObjectsCommand);
    } catch (error) {
        return error.toString();
    }

}

    /**
 * Function to retrieve list of objects with specific prefix from specific bucket
 * @param bucket
 * @param key
 * @returns {Promise<any>}
 */
    async PutObjectCommand(params: putObjectParams): Promise < any > {
    try {
        const putObjectsCommand = new PutObjectCommand(params);
        await this._client.send(putObjectsCommand);
    } catch(error) {
        return error.toString();
    }

}


}
export const s3 = new S3();
