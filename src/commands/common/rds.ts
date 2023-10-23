import { RDSClient, CreateDBSnapshotCommand, DescribeDBSnapshotsCommand, DBSnapshot, StartExportTaskCommand } from "@aws-sdk/client-rds";
import * as uuid from 'uuid';
import moment from "moment";
import { GalleryPhotoGallery, ImagePhotoGallery } from '../rds'
import { system, iam } from "./";
import { SequelizeApi } from "../rds/db/Sequelize";
import { timer } from "./timer";

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
     * @returns 
     */
    private async createDBSnapshotCommand(instance: string) {
        try {
            const params = JSON.parse(`{ 
                    "DBSnapshotIdentifier": "export-${uuid.v4()}",
                    "DBInstanceIdentifier": "${instance}" 
                }`);

            return await this._client.send(new CreateDBSnapshotCommand(params))

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
            
            const params = JSON.parse(`{ 
                    "DBSnapshotIdentifier": "${snapshot.DBSnapshotIdentifier}",
                    "DBInstanceIdentifier": "${snapshot.DBInstanceIdentifier}"
                }`);

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

        const snapshot = await this.createDBSnapshotCommand(options.instance);
      
        await this.checkStatusSnapshot(snapshot.DBSnapshot);


    }

    /**
     * Checking the status of the snapshot being created
     * @param snapshot 
     */
    public async checkStatusSnapshot(snapshot:DBSnapshot) {
        let complete = false;

        while (!complete) {
            const snapshotInstance = await this.describeDBSnapshots(snapshot);
            console.log(snapshotInstance);
            await timer.sleep(15000);

            if (snapshotInstance.DBSnapshots[0].Status === "available") {
                complete = true;     
                this.exportSnapShot(snapshot);
            }
            
            // const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            //            delay(15000);
        }
    }

    /**
     * Function which works on creating the proper iam and key permission to export exports the snapshot created and sends it to defined s3 bucket
     * @param snapshot 
     */
    private async exportSnapShot(snapshot:DBSnapshot) {
        iam.createIAMRole(this.getIamPolicyRDSToS3());
    }


    private async getIamPolicyRDSToS3() {
        return JSON.parse(`
        {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "rds.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          }),
          RoleName: roleName,
        }`);
    }


    private async startExportTask(snapshot) {

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

            return await this._client.send(new StartExportTaskCommand(params))

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