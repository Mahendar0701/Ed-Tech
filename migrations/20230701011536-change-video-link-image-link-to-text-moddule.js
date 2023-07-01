'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('Moddules', 'videoLink', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('Moddules', 'imageLink', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('Moddules', 'videoLink', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Moddules', 'imageLink', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
