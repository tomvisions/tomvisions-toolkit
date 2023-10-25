import { RDSClient, CreateDBSnapshotCommand, DescribeDBSnapshotsCommand, DBSnapshot, StartExportTaskCommand } from "@aws-sdk/client-rds";
import * as uuid from 'uuid';
import moment from "moment";
import { GalleryPhotoGallery, ImagePhotoGallery } from '../rds'
import { system, iam, kms, sts } from "./";
import { SequelizeApi } from "../rds/db/Sequelize";
import { timer } from "./timer";
//import { KeyMetadata } from "@aws-sdk/client-kms";
import { Role } from "@aws-sdk/client-iam";

export interface GalleryProperties {
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
}

export interface ImageProperties {
    id: string,
    name: string,
    key: string,
    gallery: string,
    createdAt: string,
    updatedAt: string,
}

export interface dbConfigProperties {
    DB_HOST: string,
    DATABASE: string,
    USERNAME: string,
    PASSWORD: string
}

export interface OptionExportRDS {
    bucket: string,
    instance: string,
}

class RDS {
    private _client: RDSClient;
    private _galleryName;
    private _sequelize;
    private _bucket;

    constructor() {
        const options = {
            version: "latest",
            region: "us-east-1"
        }

        this._client = new RDSClient(options);
    }

    /**
     * Initalizing the Sequelize instance with the configuration data taken from file
     * @param dbConfig 
     */
    private async initalizeSequelize(dbConfig: dbConfigProperties) {

        let options = JSON.parse(`{"host": "${dbConfig.DB_HOST}", "dialect": "mysql", "port":3306}`);
        let sequelizeClass = new SequelizeApi(dbConfig.DATABASE, dbConfig.USERNAME, dbConfig.PASSWORD, options);//.initialize();
        this._sequelize = sequelizeClass.initialize();

    }

    public async initalizeRDS(file) {
        const dbConfig = await this.readCredentialsFromFile(file)
        this.initalizeSequelize(dbConfig);

        GalleryPhotoGallery.initalize(this._sequelize)
        ImagePhotoGallery.initalize(this._sequelize)

    }

    /**
     * Function which creates a DB Snapshot
     * @param instance 
     * @returns Promise<DBSnapshot>
     */
    private async createDBSnapshotCommand(instance: string): Promise<DBSnapshot> {
        try {
            const params = {
                "DBSnapshotIdentifier": `export-${uuid.v4()}`,
                "DBInstanceIdentifier": `${instance}`
            };

            return (await this._client.send(new CreateDBSnapshotCommand(params))).DBSnapshot

        } catch (error) {
            return error.toString();
        }
    }

    /**
     * Describe DB snapshots that exists
     * @param snapshot 
     * @returns 
     */
    private async describeDBSnapshots(snapshot: DBSnapshot) {
        try {

            const params = {
                "DBSnapshotIdentifier": `${snapshot.DBSnapshotIdentifier}`,
                "DBInstanceIdentifier": `${snapshot.DBInstanceIdentifier}`
            };

            return await this._client.send(new DescribeDBSnapshotsCommand(params))

        } catch (error) {
            return error.toString();
        }

    }

    /**
     * Main function to start the exporting of database snapto to s3
     * @param options 
     */
    public async exportRDSToS3(options: OptionExportRDS) {
        this._bucket = options.bucket;

        const snapshot: DBSnapshot = await this.createDBSnapshotCommand(options.instance);

        await this.checkStatusSnapshot(snapshot);


    }

    /**
     * Checking the status of the snapshot being created
     * @param snapshot 
     */
    public async checkStatusSnapshot(snapshot: DBSnapshot) {
        let complete = false;

        while (!complete) {
            const snapshotInstance = await this.describeDBSnapshots(snapshot);

            await timer.sleep(15000);

            if (snapshotInstance.DBSnapshots[0].Status === "available") {
                complete = true;
                await this.exportSnapShot(snapshot);
            }
        }
    }

    /**
     * Function which works on creating the proper iam and key permission to export exports the snapshot created and sends it to defined s3 bucket
     * @param snapshot 
     */
    private async exportSnapShot(snapshot: DBSnapshot) {
        const roleName = `role-rds-export-${uuid.v4()}`;
        const policyName = `policy-rds-export-${uuid.v4()}`;
        const roleInstance: Role = await iam.createIAMRole(roleName, policyName, this.getIamPolicyRDSToS3(), this.getIamAssumePolicyRDSToS3());
        const key = await kms.setupKey(roleInstance, (await sts.getCallerIdentity()).Account);
        await this.startExportTask(snapshot, key, roleInstance);
    }


    private getIamPolicyRDSToS3() {
        return `{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": "s3:*",
                    "Resource": [
                        "arn:aws:s3:::${this._bucket}",
                        "arn:aws:s3:::${this._bucket}/*"
                    ]
                }
            ]
        }`
    }


    private getIamAssumePolicyRDSToS3() {
        return `{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {
                    "Service": "export.rds.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }]
        }`;
    }

    /**
     * Function which starts the export of ds snapshot to s3
     * @param snapshot 
     * @returns 
     */
    private async startExportTask(snapshot: DBSnapshot, key, roleInstance: Role) {
        try {
            const params = {
                ExportTaskIdentifier: `export-task-${uuid.v4()}`,
                S3BucketName: `${this._bucket}`,
                IamRoleArn: `${roleInstance.Arn}`,
                KmsKeyId: `${key.KeyId}`,
                SourceArn: snapshot.DBSnapshotArn
            }

            const testing = await this._client.send(new StartExportTaskCommand(params))
            console.log('the export is starting');
            console.log(testing);
            //            return await this._client.send(new StartExportTaskCommand(params))

        } catch (error) {
            return error.toString();
        }
    }

    /**
     * Function that reads the config file for the mysql database
     * @param file 
     * @returns dbConfigProperties
     */
    private async readCredentialsFromFile(file = null): Promise<dbConfigProperties> {
        try {
            if (!file) {
                throw new Error('Missing configuration file')
            }
            const data: string = await system.readFilefromPath(file);

            return JSON.parse(data);

        } catch (error) {
            return error.toString();
        }
    }





    /**
     * Find or Create gallewy name function. This function looks for gallery name given. If not found, it creates it.
     * @returns void
     */
    public async findOrCreateGalleryName() {

        const gallery = {
            id: uuid.v4(),
            name: this._galleryName,
            createdAt: moment().format('YYYY-MM-DD'),
            updatedAt: moment().format('YYYY-MM-DD'),
        };

        GalleryPhotoGallery.findOrCreate({ where: { name: this._galleryName }, defaults: gallery });
    }

    /**
     * Inserts an image to the 
     * @param key
     * @returns void | error
     */
    public async insertImageForGallery(key) {
        try {
            const image = {
                id: uuid.v4(),
                name: key.split('/')[2],
                key: key,
                gallery: this._galleryName,
                createdAt: moment().format('YYYY-MM-DD'),
                updatedAt: moment().format('YYYY-MM-DD'),
            };

            return await ImagePhotoGallery.create({ where: { key: key }, defaults: image });
        } catch (error) {

            return error.toString();
        }
    }

    public set galleryName(value) {
        this._galleryName = value;
    }


}

export const rds = new RDS();