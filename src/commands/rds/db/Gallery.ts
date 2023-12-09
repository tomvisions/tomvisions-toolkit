"use strict";

const {DataTypes, Model} = require('.');

export class GalleryPhotoGallery extends Model {

    public static initialize(sequelize) {
        return this.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            }
        }, {
            modelName: 'Gallery', sequelize: sequelize, tableName:"gallery"
        });

    }
}