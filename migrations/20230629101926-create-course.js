'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      instructorId: {
        type: Sequelize.INTEGER
      },
      instructor: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.INTEGER
      },
      level: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.DECIMAL
      },
      category: {
        type: Sequelize.STRING
      },
      enrolledStudents: {
        type: Sequelize.INTEGER
      },
      rating: {
        type: Sequelize.FLOAT
      },
      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
        type: Sequelize.DATE
      },
      syllabus: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      prerequisites: {
        type: Sequelize.STRING
      },
      resources: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Courses');
  }
};