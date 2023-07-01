'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCourse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async addUser(userId, courseId) {
      return this.create({
        userId,
        courseId,
      });
    }

    static async isUserJoined(userId, courseId) {
      const userCourse = await this.findOne({
        where: {
          userId: userId,
          courseId: courseId,
        },
      });
      return userCourse !== null;
    }
  }
  UserCourse.init({
    userId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    enrollmentDate: DataTypes.DATE,
    completionStatus: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserCourse',
  });
  return UserCourse;
};