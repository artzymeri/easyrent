"use strict";

module.exports = (sequelize, DataTypes) => {
  const InsuranceProvider = sequelize.define(
    "InsuranceProvider",
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
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "insurance_providers",
      underscored: true,
      timestamps: true,
    }
  );

  InsuranceProvider.associate = (models) => {
    InsuranceProvider.belongsTo(models.Company, {
      foreignKey: "company_id",
      as: "company",
    });
  };

  return InsuranceProvider;
};
