"use strict";

module.exports = (sequelize, DataTypes) => {
  const DeliveryPoint = sequelize.define(
    "DeliveryPoint",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "company_id",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "delivery_points",
      underscored: true,
      timestamps: true,
    }
  );

  DeliveryPoint.associate = (models) => {
    DeliveryPoint.belongsTo(models.Company, {
      foreignKey: "company_id",
      as: "company",
    });
  };

  return DeliveryPoint;
};
