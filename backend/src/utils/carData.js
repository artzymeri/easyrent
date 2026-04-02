/**
 * Car Manufacturers and their Models
 * Used for dropdowns in the frontend (make → model cascade)
 */
const carMakesModels = {
  "Acura": ["ILX", "Integra", "MDX", "NSX", "RDX", "TLX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale", "4C Spider"],
  "Aston Martin": ["DB11", "DB12", "DBS", "DBX", "Valhalla", "Vanquish"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "e-tron", "e-tron GT", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "R8", "RS3", "RS5", "RS6", "RS7", "RS Q8", "S3", "S4", "S5", "S6", "S7", "S8", "TT"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "i4", "i5", "i7", "iX", "iX1", "iX3", "M2", "M3", "M4", "M5", "M8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z4"],
  "Buick": ["Enclave", "Encore", "Encore GX", "Envision", "Envista"],
  "Cadillac": ["CT4", "CT5", "Escalade", "Lyriq", "XT4", "XT5", "XT6"],
  "Chevrolet": ["Blazer", "Bolt EUV", "Bolt EV", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado", "Suburban", "Tahoe", "Trailblazer", "Traverse", "Trax"],
  "Chrysler": ["300", "Pacifica", "Voyager"],
  "Citroën": ["Berlingo", "C3", "C3 Aircross", "C4", "C5 Aircross", "C5 X", "ë-C4"],
  "Cupra": ["Ateca", "Born", "Formentor", "Leon", "Tavascan"],
  "Dacia": ["Duster", "Jogger", "Logan", "Sandero", "Spring"],
  "Dodge": ["Challenger", "Charger", "Durango", "Hornet"],
  "Ferrari": ["296 GTB", "296 GTS", "812", "F8", "Portofino", "Purosangue", "Roma", "SF90"],
  "Fiat": ["500", "500e", "500L", "500X", "Panda", "Tipo"],
  "Ford": ["Bronco", "Bronco Sport", "Edge", "Escape", "Everest", "Expedition", "Explorer", "F-150", "F-150 Lightning", "Fiesta", "Focus", "Galaxy", "Kuga", "Maverick", "Mondeo", "Mustang", "Mustang Mach-E", "Puma", "Ranger", "S-Max", "Transit"],
  "Genesis": ["Electrified G80", "Electrified GV70", "G70", "G80", "G90", "GV60", "GV70", "GV80"],
  "GMC": ["Acadia", "Canyon", "Hummer EV", "Sierra", "Terrain", "Yukon"],
  "Honda": ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  "Hyundai": ["Elantra", "Ioniq 5", "Ioniq 6", "Kona", "Palisade", "Santa Cruz", "Santa Fe", "Sonata", "Tucson", "Venue"],
  "Infiniti": ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  "Jaguar": ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF"],
  "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Renegade", "Wagoneer", "Wrangler"],
  "Kia": ["Carnival", "EV6", "EV9", "Forte", "K5", "Niro", "Rio", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
  "Lamborghini": ["Huracán", "Revuelto", "Urus"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  "Lexus": ["ES", "GX", "IS", "LC", "LS", "LX", "NX", "RX", "RZ", "TX", "UX"],
  "Lincoln": ["Aviator", "Corsair", "Nautilus", "Navigator"],
  "Lotus": ["Eletre", "Emira"],
  "Maserati": ["Ghibli", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"],
  "Mazda": ["CX-30", "CX-5", "CX-50", "CX-70", "CX-90", "Mazda3", "MX-5 Miata", "MX-30"],
  "McLaren": ["720S", "750S", "Artura", "GT"],
  "Mercedes-Benz": ["A-Class", "AMG GT", "B-Class", "C-Class", "CLA", "CLE", "CLS", "E-Class", "EQA", "EQB", "EQC", "EQE", "EQS", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "Maybach", "S-Class", "SL", "Sprinter", "V-Class", "Vito"],
  "Mini": ["Clubman", "Convertible", "Countryman", "Hardtop"],
  "Mitsubishi": ["Eclipse Cross", "Mirage", "Outlander", "Outlander Sport"],
  "Nissan": ["Altima", "Ariya", "Frontier", "Kicks", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa", "Z"],
  "Opel": ["Astra", "Corsa", "Crossland", "Grandland", "Mokka"],
  "Peugeot": ["208", "2008", "308", "3008", "408", "508", "5008", "e-208", "e-2008", "Rifter"],
  "Porsche": ["718 Boxster", "718 Cayman", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Ram": ["1500", "2500", "3500", "ProMaster"],
  "Renault": ["Arkana", "Austral", "Captur", "Clio", "Espace", "Kadjar", "Kangoo", "Megane E-Tech", "Scenic", "Trafic", "Twingo", "Zoe"],
  "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Spectre", "Wraith"],
  "Seat": ["Arona", "Ateca", "Ibiza", "Leon", "Tarraco"],
  "Škoda": ["Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"],
  "Smart": ["#1", "#3", "EQ fortwo"],
  "Subaru": ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "Solterra", "WRX"],
  "Suzuki": ["Across", "Ignis", "Jimny", "S-Cross", "Swace", "Swift", "Vitara"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["4Runner", "86", "bZ4X", "Camry", "C-HR", "Corolla", "Corolla Cross", "Crown", "GR86", "GR Supra", "Highlander", "Land Cruiser", "Mirai", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza", "Yaris"],
  "Volkswagen": ["Arteon", "Atlas", "Atlas Cross Sport", "Golf", "GTI", "ID.3", "ID.4", "ID.5", "ID. Buzz", "Jetta", "Passat", "Polo", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg"],
  "Volvo": ["C40 Recharge", "EX30", "EX90", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
};

// Sorted makes for dropdown
const carMakes = Object.keys(carMakesModels).sort();

function getModelsForMake(make) {
  return carMakesModels[make] || [];
}

module.exports = { carMakesModels, carMakes, getModelsForMake };
