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