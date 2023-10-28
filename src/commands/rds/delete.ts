import {Command} from 'commander';
import {rds} from "../common";
import { OptionExportRDS } from '../common';


export class DeleteRDS {
    private async Run(options: OptionExportRDS) {
        try {
            await rds.deleteSnapshotByPrefix(options);

        } catch (error) {
            console.log(error.toString());


        }
    }

    public GetCommand(): Command {
        const program = new Command();
        program
            .name('delete')
            .description('Deletes snapshot of rds database based on a prefix')
            .requiredOption('-p, --prefix <value>', 'The prefix to look for in RDS snapshots')
            .action(this.Run);

        return program;
    }
}

export const deleteRDS = new DeleteRDS();
