'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubModule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getCourseSubModules(moduleId) {
      return this.findAll({ where: { moduleId } })
    }

    static getSubModule(id) {
      return this.findOne({ where: { id } })
    }
  }
  SubModule.init({
    moduleId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    order: DataTypes.INTEGER,
    imageLink: DataTypes.STRING,
    videoLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SubModule',
  });
  return SubModule;
};