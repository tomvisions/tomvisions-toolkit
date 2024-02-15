import { Command } from 'commander';
import * as uuid from 'uuid';
import * as shell from 'shelljs';
import { system } from "../common";

interface Options {
    source: string,
    destination: string,
    type: string
}

export class Rename {
    private async Run(options: Options) {

        const acceptableExtensions = ['.jpeg', '.jpg', '.PNG', '.png', '.JPG']

        try {
            const files = await system.readDirectory(options.source);

             console.log('i am here')   
             console.log(files);
            for (let file of files) {
                for (let extension of acceptableExtensions) {
                    if (file.includes(extension)) {
                        switch (options.type) {
                                    
                            case "uuid":
                                shell.cp(`${options.source}/${file.replaceAll(/ /g, '\\ ')}`, `${options.destination}/${uuid.v4()}${extension}`);
                                break;

                            case "snakecase":
                                console.log('snake cae')
                                console.log(file);
                                console.log(file.toLowerCase().replaceAll(/ /g, '\-'));
                                shell.cp(`${options.source}/${file.replaceAll(/ /g, '\\ ')}`, `${options.destination}/${file.toLowerCase().replaceAll(/ /g, '\-')}`);
                                break;

                            default:
                                break;
                        }
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
            .name('rename')
            .description('Renames images files to a different format while keeping the file extension.')
            .option('-t, --type <uuid|snakecase>', 'The type of renaming (uuid)')
            .option('-s, --source <value>', 'The folder source')
            .option('-d, --destination <value>', 'The folder destination for renaming')
            .action(this.Run);
        return program;
    }
}

export const rename = new Rename();