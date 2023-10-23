//import {readdirSync} from "fs";
import {Command} from 'commander';
///import * as uuid from 'uuid';
//import * as shell from 'shelljs';
import {s3, rds} from "../common";
//oimport {,readdirSync} from "fs";
//import {sequelize} from "./db";


interface Options {
    bucket: string,
    prefix: string,
    database:string,
    table:string,
    field:string
    project: string,
    config: string
}


export class ImportRDS {
    private async Run(options: Options) {
        try {
            await rds.initalizeRDS(options.config); 

            const listObjects = await s3.retrieveObjectsNamesFromBucket(options.bucket, options.prefix);
 

            for (let keyObject of listObjects.Contents) {
                const name: string = keyObject.Key.split('/')[keyObject.Key.split('/').length-2];
                
                if (!keyObject.Key.includes('JPG')) {
                    continue;     
                 }    

                rds.galleryName = name;
                rds.findOrCreateGalleryName();            
                rds.insertImageForGallery(keyObject.Key)
            }

        } catch (error) {
            console.log(error.toString());


        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('import')
            .description('Import files from S3 and placing them into a Database')
            .requiredOption('-b, --bucket <value>', 'The bucket to retrieve the fies from')
            .requiredOption('-p, --prefix <value>', 'The project this import is for')
            .requiredOption('-c, --config <value>', 'The database config')
            .action(this.Run);

        return program;
    }
}

export const importRDS = new ImportRDS();
