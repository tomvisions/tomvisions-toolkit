import {Command} from 'commander';
import {rds} from "../common";
import { OptionExportRDS } from '../common';


export class ExportRDS {
    private async Run(options: OptionExportRDS) {
        try {
            await rds.exportRDSToS3(options);

        } catch (error) {
            console.log(error.toString());


        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('export')
            .description('Creates snapshot of rds database and sends it over to S3')
            .requiredOption('-i, --instance <value>', 'The database instance to take a snapshot from')
            .requiredOption('-b, --bucket <value>', 'The bucket to store the snapshot to')
            .action(this.Run);

        return program;
    }
}

export const exportRDS = new ExportRDS();
