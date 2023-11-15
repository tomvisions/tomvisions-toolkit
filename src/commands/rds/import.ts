import { Command } from 'commander';
import { s3, rds } from "../common";
import { ListObjectsParams } from '../common';
//import { timer } from '../common';
interface Options {
    bucket: string,
    prefix: string,
    database: string,
    table: string,
    field: string
    project: string,
    config: string
}


export class ImportRDS {
    private async Run(options: Options) {
        try {
            await rds.initalizeRDS(options.config);


            const params: ListObjectsParams = {
                Bucket: options.bucket,
                Prefix: options.prefix,
                Marker: null
            }
            let retievingFiles = true;
            while (retievingFiles) {
                const listObjects = await s3.retrieveObjectsNamesFromBucketForRDS(params);

                for (let keyObject of listObjects.Contents) {
                    if (!keyObject.Key.includes('JPG') && !keyObject.Key.includes('jpg')) {
                        continue;
                    }
                    const id: string = keyObject.Key.split('/')[keyObject.Key.split('/').length - 2];
        
                    rds.galleryId = id;
                    await rds.insertImageForGallery(keyObject.Key);
                    await rds.findOrCreateGalleryName();
                }
                if (!listObjects.IsTruncated) {
                    retievingFiles = false;
                }

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
