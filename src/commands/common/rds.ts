import { RDSClient, CreateDBSnapshotCommand } from "@aws-sdk/client-rds";
import * as uuid from 'uuid';
import moment from "moment";
import { GalleryPhotoGallery, ImagePhotoGallery } from '../rds'
//import { SequelizeApi } from "../rds/db/Sequelize";

import { system } from "./";
//import { Sequelize } from "sequelize";
import { SequelizeApi } from "../rds/db/Sequelize";

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

class RDS {
    private _client: RDSClient;
    private _galleryName;
    private _sequelize;

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
        let sequelizeClass = new SequelizeApi(dbConfig.DATABASE, dbConfig.USERNAME,dbConfig.PASSWORD, options);//.initialize();
        this._sequelize = sequelizeClass.initialize();

    }

    public async initalizeRDS(file) {
       const dbConfig = await this.readCredentialsFromFile(file)
       this.initalizeSequelize(dbConfig);

       GalleryPhotoGallery.initalize(this._sequelize)
       ImagePhotoGallery.initalize(this._sequelize)

    }

    /**
     * Function that reads the config file for the mysql database
     * @param file 
     * @returns dbConfigProperties
     */
    private async readCredentialsFromFile(file = null) : Promise<dbConfigProperties> {
        try {
            if (!file) {
                throw new Error('Missing configuration file')
            }
            const data:string = await system.readFilefromPath(file);
          
            return JSON.parse(data);

        } catch (error) {
            return error.toString();
        }
    }


    /**
     * Creates a snapshot of a RDS instance
     * @param databaseName 
     */
    public async createDBSnapshotCommand(databaseName) {
        try {
            const params = { // CreateDBSnapshotMessage
                DBSnapshotIdentifier: "STRING_VALUE", // required
                DBInstanceIdentifier: "STRING_VALUE", // required
                Tags: [ // TagList
                    { // Tag
                        Key: "STRING_VALUE",
                        Value: "STRING_VALUE",
                    },
                ],
            };

            this._client.send(new CreateDBSnapshotCommand(params))

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