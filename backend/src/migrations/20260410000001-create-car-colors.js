"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create car_colors table
    await queryInterface.createTable("car_colors", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      hex: {
        type: Sequelize.STRING(7),
        allowNull: true,
      },
      name_en: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name_sq: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    // Insert predefined colors
    const colors = [
      { code: "white", hex: "#FFFFFF", name_en: "White", name_sq: "E bardhë", sort_order: 1 },
      { code: "black", hex: "#000000", name_en: "Black", name_sq: "E zezë", sort_order: 2 },
      { code: "silver", hex: "#C0C0C0", name_en: "Silver", name_sq: "Argjend", sort_order: 3 },
      { code: "gray", hex: "#808080", name_en: "Gray", name_sq: "Gri", sort_order: 4 },
      { code: "dark_gray", hex: "#404040", name_en: "Dark Gray", name_sq: "Gri e errët", sort_order: 5 },
      { code: "charcoal", hex: "#36454F", name_en: "Charcoal", name_sq: "Qymyr", sort_order: 6 },
      { code: "red", hex: "#FF0000", name_en: "Red", name_sq: "E kuqe", sort_order: 7 },
      { code: "dark_red", hex: "#8B0000", name_en: "Dark Red", name_sq: "E kuqe e errët", sort_order: 8 },
      { code: "burgundy", hex: "#800020", name_en: "Burgundy", name_sq: "Bordo", sort_order: 9 },
      { code: "maroon", hex: "#800000", name_en: "Maroon", name_sq: "Kafe e kuqe", sort_order: 10 },
      { code: "blue", hex: "#0000FF", name_en: "Blue", name_sq: "Blu", sort_order: 11 },
      { code: "dark_blue", hex: "#00008B", name_en: "Dark Blue", name_sq: "Blu e errët", sort_order: 12 },
      { code: "navy", hex: "#000080", name_en: "Navy Blue", name_sq: "Blu e detit", sort_order: 13 },
      { code: "light_blue", hex: "#ADD8E6", name_en: "Light Blue", name_sq: "Blu e çelët", sort_order: 14 },
      { code: "sky_blue", hex: "#87CEEB", name_en: "Sky Blue", name_sq: "Blu qielli", sort_order: 15 },
      { code: "royal_blue", hex: "#4169E1", name_en: "Royal Blue", name_sq: "Blu mbretërore", sort_order: 16 },
      { code: "green", hex: "#008000", name_en: "Green", name_sq: "E gjelbër", sort_order: 17 },
      { code: "dark_green", hex: "#006400", name_en: "Dark Green", name_sq: "E gjelbër e errët", sort_order: 18 },
      { code: "olive", hex: "#808000", name_en: "Olive", name_sq: "Ulliri", sort_order: 19 },
      { code: "lime", hex: "#00FF00", name_en: "Lime Green", name_sq: "E gjelbër limoni", sort_order: 20 },
      { code: "teal", hex: "#008080", name_en: "Teal", name_sq: "Blu-gjelbër", sort_order: 21 },
      { code: "yellow", hex: "#FFFF00", name_en: "Yellow", name_sq: "E verdhë", sort_order: 22 },
      { code: "gold", hex: "#FFD700", name_en: "Gold", name_sq: "Ari", sort_order: 23 },
      { code: "orange", hex: "#FFA500", name_en: "Orange", name_sq: "Portokalli", sort_order: 24 },
      { code: "brown", hex: "#8B4513", name_en: "Brown", name_sq: "Kafe", sort_order: 25 },
      { code: "beige", hex: "#F5F5DC", name_en: "Beige", name_sq: "Bezhë", sort_order: 26 },
      { code: "tan", hex: "#D2B48C", name_en: "Tan", name_sq: "Krem", sort_order: 27 },
      { code: "champagne", hex: "#F7E7CE", name_en: "Champagne", name_sq: "Shampanjë", sort_order: 28 },
      { code: "ivory", hex: "#FFFFF0", name_en: "Ivory", name_sq: "Fildish", sort_order: 29 },
      { code: "pearl", hex: "#FDEEF4", name_en: "Pearl White", name_sq: "E bardhë perla", sort_order: 30 },
      { code: "purple", hex: "#800080", name_en: "Purple", name_sq: "Vjollcë", sort_order: 31 },
      { code: "pink", hex: "#FFC0CB", name_en: "Pink", name_sq: "Rozë", sort_order: 32 },
      { code: "magenta", hex: "#FF00FF", name_en: "Magenta", name_sq: "Magenta", sort_order: 33 },
      { code: "bronze", hex: "#CD7F32", name_en: "Bronze", name_sq: "Bronz", sort_order: 34 },
      { code: "copper", hex: "#B87333", name_en: "Copper", name_sq: "Bakër", sort_order: 35 },
      { code: "titanium", hex: "#878681", name_en: "Titanium", name_sq: "Titan", sort_order: 36 },
      { code: "graphite", hex: "#383838", name_en: "Graphite", name_sq: "Grafit", sort_order: 37 },
      { code: "metallic_silver", hex: "#AAA9AD", name_en: "Metallic Silver", name_sq: "Argjend metalik", sort_order: 38 },
      { code: "metallic_blue", hex: "#4682B4", name_en: "Metallic Blue", name_sq: "Blu metalik", sort_order: 39 },
      { code: "metallic_gray", hex: "#71797E", name_en: "Metallic Gray", name_sq: "Gri metalik", sort_order: 40 },
      { code: "midnight_blue", hex: "#191970", name_en: "Midnight Blue", name_sq: "Blu e mesnatës", sort_order: 41 },
      { code: "racing_green", hex: "#004225", name_en: "Racing Green", name_sq: "Gjelbër garuese", sort_order: 42 },
      { code: "cream", hex: "#FFFDD0", name_en: "Cream", name_sq: "Krem", sort_order: 43 },
      { code: "wine", hex: "#722F37", name_en: "Wine Red", name_sq: "E kuqe verë", sort_order: 44 },
      { code: "turquoise", hex: "#40E0D0", name_en: "Turquoise", name_sq: "Turkuaz", sort_order: 45 },
      { code: "coral", hex: "#FF7F50", name_en: "Coral", name_sq: "Korali", sort_order: 46 },
      { code: "aqua", hex: "#00FFFF", name_en: "Aqua", name_sq: "Ujore", sort_order: 47 },
      { code: "sand", hex: "#C2B280", name_en: "Sand", name_sq: "Rërë", sort_order: 48 },
    ];

    await queryInterface.bulkInsert("car_colors", colors.map(c => ({
      ...c,
      created_at: new Date(),
      updated_at: new Date(),
    })));

    // Add color_id column to cars table
    await queryInterface.addColumn("cars", "color_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "car_colors",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Migrate existing color data - map old color strings to new color IDs
    // This uses AI-like mapping logic based on color name matching
    const colorMappings = {
      // Exact matches and common variations
      "white": "white", "e bardhë": "white", "e bardhe": "white", "bardhe": "white", "bardhë": "white",
      "black": "black", "e zezë": "black", "e zeze": "black", "zeze": "black", "zezë": "black",
      "silver": "silver", "argjend": "silver", "silber": "silver",
      "gray": "gray", "grey": "gray", "gri": "gray", "e hirtë": "gray", "hirte": "gray",
      "dark gray": "dark_gray", "dark grey": "dark_gray", "gri e errët": "dark_gray", "gri e erret": "dark_gray",
      "charcoal": "charcoal", "qymyr": "charcoal",
      "red": "red", "e kuqe": "red", "kuqe": "red",
      "dark red": "dark_red", "e kuqe e errët": "dark_red",
      "burgundy": "burgundy", "bordo": "burgundy",
      "maroon": "maroon",
      "blue": "blue", "blu": "blue", "e kaltër": "blue", "kalter": "blue",
      "dark blue": "dark_blue", "blu e errët": "dark_blue", "blu e erret": "dark_blue",
      "navy": "navy", "navy blue": "navy", "blu e detit": "navy",
      "light blue": "light_blue", "blu e çelët": "light_blue", "blu e celet": "light_blue",
      "sky blue": "sky_blue", "blu qielli": "sky_blue",
      "royal blue": "royal_blue",
      "green": "green", "e gjelbër": "green", "e gjelber": "green", "gjelber": "green", "gjelbër": "green",
      "dark green": "dark_green", "e gjelbër e errët": "dark_green",
      "olive": "olive", "ulliri": "olive",
      "lime": "lime", "lime green": "lime",
      "teal": "teal",
      "yellow": "yellow", "e verdhë": "yellow", "e verdhe": "yellow", "verdhe": "yellow",
      "gold": "gold", "ari": "gold", "ar": "gold", "golden": "gold",
      "orange": "orange", "portokalli": "orange",
      "brown": "brown", "kafe": "brown", "café": "brown",
      "beige": "beige", "bezhë": "beige", "bezhe": "beige",
      "tan": "tan",
      "champagne": "champagne", "shampanjë": "champagne",
      "ivory": "ivory", "fildish": "ivory",
      "pearl": "pearl", "pearl white": "pearl", "perla": "pearl", "e bardhë perla": "pearl",
      "purple": "purple", "vjollcë": "purple", "vjollce": "purple", "violet": "purple",
      "pink": "pink", "rozë": "pink", "roze": "pink",
      "magenta": "magenta",
      "bronze": "bronze", "bronz": "bronze",
      "copper": "copper", "bakër": "copper", "baker": "copper",
      "titanium": "titanium", "titan": "titanium",
      "graphite": "graphite", "grafit": "graphite",
      "metallic silver": "metallic_silver", "argjend metalik": "metallic_silver",
      "metallic blue": "metallic_blue", "blu metalik": "metallic_blue",
      "metallic gray": "metallic_gray", "metallic grey": "metallic_gray", "gri metalik": "metallic_gray",
      "midnight blue": "midnight_blue", "blu e mesnatës": "midnight_blue",
      "racing green": "racing_green",
      "cream": "cream", "krem": "cream",
      "wine": "wine", "wine red": "wine", "e kuqe verë": "wine",
      "turquoise": "turquoise", "turkuaz": "turquoise",
      "coral": "coral", "korali": "coral",
      "aqua": "aqua", "ujore": "aqua",
      "sand": "sand", "rërë": "sand", "rere": "sand",
    };

    // Get all existing colors from cars and map them
    const [existingCars] = await queryInterface.sequelize.query(
      "SELECT id, color FROM cars WHERE color IS NOT NULL AND color != ''"
    );

    for (const car of existingCars) {
      const normalizedColor = car.color.toLowerCase().trim();
      let colorCode = colorMappings[normalizedColor];
      
      // If no exact match, try partial matching
      if (!colorCode) {
        for (const [key, code] of Object.entries(colorMappings)) {
          if (normalizedColor.includes(key) || key.includes(normalizedColor)) {
            colorCode = code;
            break;
          }
        }
      }

      // Default fallback based on common patterns
      if (!colorCode) {
        if (normalizedColor.includes("white") || normalizedColor.includes("bardh")) colorCode = "white";
        else if (normalizedColor.includes("black") || normalizedColor.includes("zez")) colorCode = "black";
        else if (normalizedColor.includes("silver") || normalizedColor.includes("argjend")) colorCode = "silver";
        else if (normalizedColor.includes("gray") || normalizedColor.includes("grey") || normalizedColor.includes("gri")) colorCode = "gray";
        else if (normalizedColor.includes("red") || normalizedColor.includes("kuq")) colorCode = "red";
        else if (normalizedColor.includes("blue") || normalizedColor.includes("blu")) colorCode = "blue";
        else if (normalizedColor.includes("green") || normalizedColor.includes("gjelb")) colorCode = "green";
        else if (normalizedColor.includes("yellow") || normalizedColor.includes("verdh")) colorCode = "yellow";
        else if (normalizedColor.includes("orange") || normalizedColor.includes("portokall")) colorCode = "orange";
        else if (normalizedColor.includes("brown") || normalizedColor.includes("kafe")) colorCode = "brown";
        else if (normalizedColor.includes("beige") || normalizedColor.includes("bezh")) colorCode = "beige";
        else if (normalizedColor.includes("purple") || normalizedColor.includes("vjoll")) colorCode = "purple";
        else if (normalizedColor.includes("pink") || normalizedColor.includes("roz")) colorCode = "pink";
        else colorCode = "gray"; // Ultimate fallback
      }

      // Get color ID and update car
      const [[colorRecord]] = await queryInterface.sequelize.query(
        `SELECT id FROM car_colors WHERE code = '${colorCode}'`
      );
      
      if (colorRecord) {
        await queryInterface.sequelize.query(
          `UPDATE cars SET color_id = ${colorRecord.id} WHERE id = ${car.id}`
        );
      }
    }

    // Optionally remove the old color column (keeping it for now for safety)
    // await queryInterface.removeColumn("cars", "color");
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key column from cars
    await queryInterface.removeColumn("cars", "color_id");
    
    // Drop car_colors table
    await queryInterface.dropTable("car_colors");
  },
};
