import {Command} from 'commander';
import * as uuid from 'uuid';
import * as shell from 'shelljs';
import {system} from "../common";

interface Options {
    source: string,
    destination:string,
    type: string
}

export class Rename {
    private async Run(options: Options) {

        const acceptableExtensions = ['.jpeg', '.jpg', '.PNG', '.png']

        try {
            const files = await system.readDirectory(options.source);
         
            for (let file of files) {
                for (let extension of acceptableExtensions) {
                    if (file.includes(extension)) {
                        shell.cp(`${options.source}/${file.replaceAll(/ /g, '\\ ')}`, `${options.destination}/${uuid.v4()}${extension}`);
                    }
                }
            }
            process.exit(0);

        } catch (error) {
            console.log('the error');
            console.log(error);
        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('rename')
            .description('Renames images files to UUID format while keeping the file extension.')
            .option('-t, --type <value>', 'The type of renaming (uuid)')
            .option('-s, --source <value>', 'The folder source')
            .option('-d, --destination <value>', 'The folder destination for renaming')
            .action(this.Run);
        return program;
    }
}

export const rename = new Rename();