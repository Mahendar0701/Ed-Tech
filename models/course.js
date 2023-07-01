'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getAllUpcomingCourses() {
      return this.findAll();
    }

    static getCourse(id) {
      return this.findOne({ where: { id } })
    }

    static updateStudents(enrolledStudents, courseId) {
      return this.update(
        {
          enrolledStudents,
        },
        { where: { id: courseId } }
      );
    }
  }
  Course.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    instructorId: DataTypes.INTEGER,
    instructor: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    level: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    category: DataTypes.STRING,
    enrolledStudents: DataTypes.INTEGER,
    rating: DataTypes.FLOAT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    syllabus: DataTypes.ARRAY(DataTypes.STRING),
    prerequisites: DataTypes.STRING,
    resources: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};