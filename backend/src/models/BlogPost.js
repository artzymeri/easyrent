"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BlogPost extends Model {
    static associate(models) {
      BlogPost.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
    }
  }

  BlogPost.init(
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
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      excerpt: {
        type: DataTypes.STRING(1000),
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      coverImageUrl: {
        type: DataTypes.TEXT("long"),
        field: "cover_image_url",
      },
      authorName: {
        type: DataTypes.STRING(255),
        field: "author_name",
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_published",
      },
      publishedAt: {
        type: DataTypes.DATE,
        field: "published_at",
      },
    },
    {
      sequelize,
      modelName: "BlogPost",
      tableName: "blog_posts",
      underscored: true,
      timestamps: true,
    }
  );

  return BlogPost;
};
