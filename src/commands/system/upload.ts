import {Command} from 'commander';
const axios = require('axios');
import imageToUri from 'image-to-uri';
import {system} from "../common";

interface Options {
    directory: string,
    gallery: string
}

export class Upload {
    private async Run(options: Options) {

        const acceptableExtensions = ['.jpeg', '.jpg', '.JPG', '.PNG', '.png']
        try {

            const files = await system.readDirectory(options.directory);
            for (let file of files) {
                for (let extension of acceptableExtensions) {
                    if (file.includes(extension)) {
                        const theFile = imageToUri(`${options.directory}/${file}`);
                        await axios.postForm('http://127.0.0.1:3000/api/v1/gallery/image', {
                            gallery_id: options.gallery,
                            file: theFile
                        })
                    }
                }
            }

        } catch (error) {
            console.log('the error');
            console.log(error);
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('upload')
            .description('Renames files found to Compares currently configured employees in Dynamo against the corporate active directory to determine if any users are inactive in the corporate AD')
            .option('-d, --directory <value>', 'The folder were the images are')
            .option('-g, --gallery <value>', 'The gallery id to import for')
            .action(this.Run);
        return program;
    }
}

export const upload = new Upload();
