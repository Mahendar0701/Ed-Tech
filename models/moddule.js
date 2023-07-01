'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Moddule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getCourseModules(courseId) {
      return this.findAll({ where: { courseId } })
    }

    static getModule(id) {
      return this.findOne({ where: { id } })
    }
  }
  Moddule.init({
    courseId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    order: DataTypes.INTEGER,
    imageLink: DataTypes.STRING,
    videoLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Moddule',
  });
  return Moddule;
};