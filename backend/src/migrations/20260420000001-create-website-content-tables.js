"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ── Website Slides ──
    await queryInterface.createTable("website_slides", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      button_text: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      button_link: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // ── Website Pages (about, contact, custom) ──
    await queryInterface.createTable("website_pages", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onDelete: "CASCADE",
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "about, contact, etc.",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
        comment: "HTML or markdown content",
      },
      meta_description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      hero_image_url: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      extra_data: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
        comment: "JSON for page-specific fields (contact hours, map embed, etc.)",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // ── Blog Posts ──
    await queryInterface.createTable("blog_posts", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      excerpt: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      content: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      cover_image_url: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      author_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // ── Add unique constraint for website_pages ──
    await queryInterface.addIndex("website_pages", ["company_id", "slug"], {
      unique: true,
      name: "website_pages_company_slug_unique",
    });

    // ── Add unique constraint for blog slugs per company ──
    await queryInterface.addIndex("blog_posts", ["company_id", "slug"], {
      unique: true,
      name: "blog_posts_company_slug_unique",
    });

    // ── Add new website config fields to companies ──
    await queryInterface.addColumn("companies", "hero_slide_source", {
      type: Sequelize.STRING(20),
      defaultValue: "custom",
      allowNull: false,
      comment: "custom = uploaded slides, cars = show car images, both = mix",
    });

    await queryInterface.addColumn("companies", "website_nav_links", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "JSON array of enabled nav links: home, cars, about, contact, blog",
    });

    await queryInterface.addColumn("companies", "website_primary_color", {
      type: Sequelize.STRING(7),
      allowNull: true,
      comment: "Hex color for template accent",
    });

    await queryInterface.addColumn("companies", "website_hero_title", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "website_hero_subtitle", {
      type: Sequelize.STRING(1000),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("blog_posts");
    await queryInterface.dropTable("website_pages");
    await queryInterface.dropTable("website_slides");
    await queryInterface.removeColumn("companies", "hero_slide_source");
    await queryInterface.removeColumn("companies", "website_nav_links");
    await queryInterface.removeColumn("companies", "website_primary_color");
    await queryInterface.removeColumn("companies", "website_hero_title");
    await queryInterface.removeColumn("companies", "website_hero_subtitle");
  },
};
