import {readdirSync} from "fs";
import {Command} from 'commander';
import * as uuid from 'uuid';
import * as shell from 'shelljs';


interface Options {
    directory: string,
    type: string
}

export class Rename {
    private async Run(options: Options) {
        const readDirectory = (location) => {
            try {
                return readdirSync(location);
            } catch (error) {
                return error.toString();
            }
        }

        const acceptableExtensions = ['.jpeg', '.jpg', '.PNG', '.png']

        try {
            const files = await readDirectory(options.directory);
            switch (options.type) {
                case "uuid":

                    break;

                default:
                    break;
            }

            for (let file of files) {
                for (let extension of acceptableExtensions) {
                    if (file.includes(extension)) {
                        shell.cp(`${options.directory}/${file.replaceAll(/ /g, '\\ ')}`, `${options.directory}/${uuid.v4()}${extension}`);
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
            .option('-d, --directory <value>', 'The folder focused on renaming')
            .action(this.Run);
        return program;
    }
}

const rename = new Rename();
export {rename}
