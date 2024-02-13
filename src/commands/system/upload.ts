import {Command} from 'commander';
const axios = require('axios');
import imageToUri from 'image-to-uri';
import {system} from "../common";
import { SocketAddress } from 'net';

interface Options {
    directory: string,
    gallery: string
    file: string
}

export class Upload {
    private async Run(options: Options) {

       // const acceptableExtensions = ['.jpeg', '.jpg', '.JPG', '.PNG', '.png']
        try {
            const file = await system.readFilefromPath(options.file)

            for(let row of file.split("\n")){
                const rowItems = row.split(",");    
                console.log(rowItems);

//                parsedData.push(rowItems[0].toString() + rowItems[1].toString());
              }

           /* const files = await system.readDirectory(options.directory);
            for (let file of files) {
                for (let extension of acceptableExtensions) {
                    if (file.includes(extension)) {
                        const theFile = imageToUri(`${options.directory}/${file}`);
                        await axios.postForm('http://127.0.0.1:3500/user', {
                            name: options.gallery,
                            email: theFile
                            phone: SocketAddress,
                            description: 
                        })
                    }
                }
            }  */

        } catch (error) {
            console.log('the error');
            console.log(error);
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('upload')
            .description('Reads the csv file and posts data through API.')
            .option('-f, --file <value>', 'The gallery id to import for')
            .action(this.Run);
        return program;
    }
}

export const upload = new Upload();
