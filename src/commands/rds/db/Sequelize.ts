import  {Sequelize, Dialect} from '.';

export interface OptionsSequelize {
    host:string;
    dialect: Dialect;
    port:number;
}

/**
 * SequelizeApi class. A class that deals with working with Sequelize
 */
export class SequelizeApi {
    private _database: string;
    private _username: string;
    private _password: string;
    private _options: OptionsSequelize;

    /**
     * Constructor for class
     * @param database
     * @param username
     * @param password
     * @param options
     */
    constructor(database: string, username: string, password: string, options: OptionsSequelize) {
        this._database = database;
        this._username = username;
        this._password = password;
        this._options = options;
    }

    /**
     * Initialization function for sequelize
     */
    public initialize() {
      return new Sequelize(this._database, this._username, this._password, this._options);
    };
}

//console.log('hello')
//console.log(process.env);
//let options;
/*if (process.env.LOCAL) {
    options = {host: '127.0.0.1', dialect: 'mysql', port:3306}
} else if ( process.env.NODE_ENV === 'staging') {
    options = {host: process.env.HOST_STAGE, dialect: 'mysql', port:33306}
} else {
    options = {host: process.env.HOST_PRODUCTION, dialect: 'mysql', port:33306}
}

let sequelizeClass = new SequelizeApi(process.env.DATABASE, process.env.USERNAME,process.env.PASSWORD, options );//.initialize();
let sequelize = sequelizeClass.initialize();

export {sequelize};
*/
//export const sequelize = null;