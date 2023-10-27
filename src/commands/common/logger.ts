//const log = require('loglevel');
const { red, cyan, blue, magenta, yellow } = require('chalk');
import * as log4js from 'log4js';

class LOGGER {
    private _logger;

    constructor() {
        log4js.configure({
            appenders: {
                out: { type: 'stdout', layout: { type: 'coloured' } }
            },
            categories: {
                default: { appenders: ['out'], level: 'INFO' }
            }
        });
    //    this._logger = log4js.getLogger(params);
    }

    //        this._logger = log4js.getLogger(params.'params.action');


    private warn(message, output) {
        this._logger.warn('WARNING: %s', message, output);
    }

    private trace(message, output) {
        this._logger.trace('TRACE: %s', message, output);
    }


    private info(message, output) {
        if (output) 
            this._logger.info(cyan.bold('INFO'), message, output);
        else
            this._logger.info(cyan.bold('INFO'), message);
    }

    private debug(message, output) {
        this._logger.debug('DEBUG: %s', message, output);
    }

    private error(message, output) {
        this._logger.error(red.red('%s: %s'), 'ERROR', message, output);
    }

    public logMessage(message = null, object = null, logLevel = null, section = null) {
        if (section) {
            this._logger = log4js.getLogger(section);
        }
        switch (logLevel) {
            case 'DEBUG':
                this.debug(`${blue.bold(message)}`, { data: object });
                break;
            case 'TRACE':
                this.trace(`${magenta.bold(message)}`, { data: object });
                break;
            case 'INFO':
                this.info(`${cyan(message)}`, object = object !== null  ? { data : object } : null  );
                break;
            case 'ERROR':
                this.error(`${red.red(message)}`, { data: object });
                process.exit(0);
                break;
            case 'WARN':
                this.warn(`${yellow.bold(message)}`, { data: object });
                break;
        }
    }
}

export const logger = new LOGGER();

