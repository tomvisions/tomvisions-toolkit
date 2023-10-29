import { RDSClient, CreateDBSnapshotCommand, DescribeDBSnapshotsCommand, DBSnapshot, StartExportTaskCommand, StartExportTaskCommandOutput, DescribeExportTasksCommand, DeleteDBSnapshotCommand } from "@aws-sdk/client-rds";
import * as uuid from 'uuid';
import moment from "moment";
import { GalleryPhotoGallery, ImagePhotoGallery } from '../rds'
import { system, iam, kms, sts, logger } from "./";
import { SequelizeApi } from "../rds/db/Sequelize";
import { timer } from "./timer";
//import { KeyMetadata } from "@aws-sdk/client-kms";
import { Role } from "@aws-sdk/client-iam";
import { KeyMetadata } from "@aws-sdk/client-kms";


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
     * @returns Promise<DBSnapshot> | null
     */
    private async createDBSnapshotCommand(instance: string): Promise<DBSnapshot> {
        try {
            const params = {
                "DBSnapshotIdentifier": `export-${uuid.v4()}`,
                "DBInstanceIdentifier": `${instance}`
            };

            return (await this._client.send(new CreateDBSnapshotCommand(params))).DBSnapshot

        } catch (error) {
            logger.logMessage(error.toString(), error, 'ERROR')
            return error.toString;
        }
    }

    /**
     * Describe DB snapshots that exists
     * @param snapshot 
     * @returns 
     */
    private async describeDBSnapshots(params) : Promise<DBSnapshot[]> {
        try {
            
            return (await this._client.send(new DescribeDBSnapshotsCommand(params))).DBSnapshots

        } catch (error) {
            logger.logMessage('Unable to describe snapshot', error, 'ERROR');
            return error.toString();
        }

    }

    /**
     * Main function to start the exporting of database snapto to s3
     * @param options 
     */
    public async exportRDSToS3(options: OptionExportRDS) {
        this._bucket = options.bucket;

        logger.logMessage('Starting export process', null, 'INFO', 'Snapshot creation');

        const snapshot: DBSnapshot = await this.createDBSnapshotCommand(options.instance);

        await this.checkStatusSnapshot(snapshot);


    }

    /**
     * Checking the status of the snapshot being created
     * @param snapshot 
     */
    public async checkStatusSnapshot(snapshot: DBSnapshot) {
        let complete = false;

        logger.logMessage('Creating Snapshot', null, 'INFO');

        while (!complete) {

            const params = {
                "DBSnapshotIdentifier": `${snapshot.DBSnapshotIdentifier}`,
                "DBInstanceIdentifier": `${snapshot.DBInstanceIdentifier}`
            };
            const snapshotInstance = await this.describeDBSnapshots(params);
   
            if (snapshotInstance && snapshotInstance[0].Status === "available") {
                complete = true;
                logger.logMessage('Snapspot has been created', null, 'INFO')

                await this.exportSnapShot(snapshot);
            } 

            await timer.sleep(10000);
        } 
    }

    /**
     * Function which works on creating the proper iam and key permission to export exports the snapshot created and sends it to defined s3 bucket
     * @param snapshot 
     */
    private async exportSnapShot(snapshot: DBSnapshot) {
        logger.logMessage('Starting export process', null, 'INFO', 'Export process')

        const roleName = `role-rds-export-${uuid.v4()}`;
        const policyName = `policy-rds-export-${uuid.v4()}`;
        const roleInstance: Role = await iam.createIAMRole(roleName, policyName, this.getIamPolicyRDSToS3(), this.getIamAssumePolicyRDSToS3());
        const key: KeyMetadata = await kms.setupKey(roleInstance, (await sts.getCallerIdentity()).Account);
        const exportSnapshot = await this.startExportTask(snapshot, key, roleInstance);
        let exportingInProcess = true;

        while (exportingInProcess) {
            const exportedTask = await this.describeExportTask(exportSnapshot)

            if (exportedTask.ExportTasks && exportedTask.ExportTasks[0].Status === "COMPLETE") {
                exportingInProcess = false;
                logger.logMessage('Export has been completed', { exportedSnapshotId: exportedTask.ExportTasks[0].ExportTaskIdentifier }, 'INFO');
            }

            await timer.sleep(10000);
        }

        await iam.cleanUpRole(roleInstance);
        await kms.cleanUpKey(key.KeyId);
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
    private async startExportTask(snapshot: DBSnapshot, key, roleInstance: Role): Promise<StartExportTaskCommandOutput> {
        try {
            logger.logMessage('Starting export of snapshot to S3', null, 'INFO', 'Export Task');

            const params = {
                ExportTaskIdentifier: `export-task-${uuid.v4()}`,
                S3BucketName: `${this._bucket}`,
                IamRoleArn: `${roleInstance.Arn}`,
                KmsKeyId: `${key.KeyId}`,
                SourceArn: snapshot.DBSnapshotArn
            }

            return await this._client.send(new StartExportTaskCommand(params))
        } catch (error) {
            logger.logMessage('Error exporting RDS snapshot', 'ERROR', error)
            process.exit(0)
        }
    }

    /**
     * Function which exports the task
     * @param exportSnapshot 
     * @returns 
     */
    private async describeExportTask(exportSnapshot: StartExportTaskCommandOutput) {
        try {
            const params = {
                ExportTaskIdentifier: exportSnapshot.ExportTaskIdentifier
            }

            return await this._client.send(new DescribeExportTasksCommand(params));
        } catch (error) {
            return error.toString();
        }
    }


    /**
     * 
     * @returns 
     */
    private async deleteDBSnapShot(dbSnmpshotIdentifier) {
        try {
            const params = {
                DBSnapshotIdentifier: dbSnmpshotIdentifier
            }

            logger.logMessage('Delete snapshot with params', { DBSnapshotIdentifier: dbSnmpshotIdentifier }, 'INFO');

            return await this._client.send(new DeleteDBSnapshotCommand(params));
        } catch (error) {
            return error.toString();
        }
        DeleteDBSnapshotCommand

    }

    /**
     * Function that deletes snapshots based on prefix
     * @param options 
     */
    public async deleteSnapshotByPrefix(options) {
        const prefix = options.prefix;
        logger.logMessage('About to delete snapshots based on prefix', null, 'INFO', 'Delete Snapshots');
       // const results = await this.describeDBSnapshots({filter:prefix});
        //console.log(await this.describeDBSnapshots({filter:prefix}));

        (await this.describeDBSnapshots({filter:prefix})).map(async(snapshots) => {
            await this.deleteDBSnapShot(snapshots.DBSnapshotIdentifier)
        });
    }

    /**
     * Function to clean up the Snapshot created 
     * @param snapShotSourceArn 
     */
    async cleanupSnapshot(snapShotSourceArn) {
        console.log('the snapshot');
        console.log(snapShotSourceArn);

        const params = {
            DBSnapshotIdentifier: snapShotSourceArn
        }

        const snapshotObject = await this.describeDBSnapshots(params);
        console.log('the object');
        console.group(snapshotObject);
        await this.deleteDBSnapShot(snapshotObject['DBSnapshotIdentifier']);


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