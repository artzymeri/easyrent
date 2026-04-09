// ── Country, City, and Phone Code Data ───────────────────────

export interface CountryInfo {
  name: string;
  code: string;
  phoneCode: string;
  cities: string[];
}

export const COUNTRIES: CountryInfo[] = [
  {
    name: "Kosovo",
    code: "XK",
    phoneCode: "+383",
    cities: ["Pristina", "Prizren", "Peja", "Mitrovica", "Gjilan", "Ferizaj", "Gjakova", "Podujeva", "Vushtrri", "Suhareka", "Rahovec", "Drenas", "Lipjan", "Malisheva", "Kamenica", "Viti", "Deçan", "Istog", "Klinë", "Skenderaj", "Dragash", "Fushë Kosovë", "Kaçanik", "Shtime", "Obiliq", "Graçanica", "Hani i Elezit", "Mamushë", "Junik", "Kllokot", "Partesh", "Ranillug", "Shterpce"],
  },
  {
    name: "Albania",
    code: "AL",
    phoneCode: "+355",
    cities: ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër", "Fier", "Korçë", "Berat", "Lushnjë", "Pogradec", "Kavajë", "Gjirokastër", "Kukës", "Sarandë", "Lezhë", "Peshkopi", "Kuçovë", "Krujë", "Burrel", "Përmet", "Gramsh", "Librazhd", "Tepelenë", "Bulqizë", "Pukë", "Ersekë", "Bajzë"],
  },
  {
    name: "North Macedonia",
    code: "MK",
    phoneCode: "+389",
    cities: ["Skopje", "Bitola", "Kumanovo", "Prilep", "Tetovo", "Ohrid", "Veles", "Štip", "Strumica", "Kavadarci", "Kočani", "Gostivar", "Kičevo", "Struga", "Gevgelija", "Negotino", "Debar"],
  },
  {
    name: "Montenegro",
    code: "ME",
    phoneCode: "+382",
    cities: ["Podgorica", "Nikšić", "Herceg Novi", "Bijelo Polje", "Budva", "Cetinje", "Bar", "Berane", "Kotor", "Tivat", "Pljevlja", "Ulcinj", "Rožaje", "Danilovgrad"],
  },
  {
    name: "Serbia",
    code: "RS",
    phoneCode: "+381",
    cities: ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak", "Novi Pazar", "Kraljevo", "Smederevo", "Leskovac", "Užice", "Valjevo", "Vranje", "Šabac", "Sombor", "Požarevac", "Pirot", "Kruševac", "Kikinda", "Sremska Mitrovica", "Jagodina", "Bor"],
  },
  {
    name: "Croatia",
    code: "HR",
    phoneCode: "+385",
    cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Pula", "Slavonski Brod", "Karlovac", "Varaždin", "Šibenik", "Sisak", "Dubrovnik", "Bjelovar", "Vinkovci", "Vukovar"],
  },
  {
    name: "Bosnia and Herzegovina",
    code: "BA",
    phoneCode: "+387",
    cities: ["Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar", "Bijeljina", "Brčko", "Prijedor", "Trebinje", "Doboj", "Cazin", "Bihać", "Livno", "Goražde"],
  },
  {
    name: "Slovenia",
    code: "SI",
    phoneCode: "+386",
    cities: ["Ljubljana", "Maribor", "Celje", "Kranj", "Koper", "Velenje", "Novo Mesto", "Ptuj", "Kamnik", "Nova Gorica", "Murska Sobota", "Domžale", "Škofja Loka", "Jesenice"],
  },
  {
    name: "Germany",
    code: "DE",
    phoneCode: "+49",
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Mannheim", "Karlsruhe", "Augsburg", "Wiesbaden"],
  },
  {
    name: "Austria",
    code: "AT",
    phoneCode: "+43",
    cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "Sankt Pölten", "Dornbirn", "Wiener Neustadt", "Steyr", "Feldkirch", "Bregenz"],
  },
  {
    name: "Switzerland",
    code: "CH",
    phoneCode: "+41",
    cities: ["Zürich", "Geneva", "Basel", "Lausanne", "Bern", "Winterthur", "Lucerne", "St. Gallen", "Lugano", "Biel/Bienne", "Thun", "Köniz", "La Chaux-de-Fonds", "Fribourg"],
  },
  {
    name: "Italy",
    code: "IT",
    phoneCode: "+39",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona", "Messina", "Padua", "Trieste", "Brescia", "Parma", "Taranto", "Prato", "Modena", "Reggio Calabria", "Reggio Emilia", "Perugia", "Livorno"],
  },
  {
    name: "Greece",
    code: "GR",
    phoneCode: "+30",
    cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Ioannina", "Kavala", "Rhodes", "Chania", "Chalcis", "Serres", "Alexandroupolis", "Corfu", "Kalamata"],
  },
  {
    name: "Turkey",
    code: "TR",
    phoneCode: "+90",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Samsun", "Denizli", "Trabzon", "Malatya"],
  },
  {
    name: "Bulgaria",
    code: "BG",
    phoneCode: "+359",
    cities: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Sliven", "Dobrich", "Shumen", "Pernik", "Haskovo", "Yambol", "Pazardzhik", "Blagoevgrad"],
  },
  {
    name: "Romania",
    code: "RO",
    phoneCode: "+40",
    cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați", "Ploiești", "Oradea", "Brăila", "Arad", "Pitești", "Sibiu", "Bacău"],
  },
  {
    name: "Hungary",
    code: "HU",
    phoneCode: "+36",
    cities: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza", "Kecskemét", "Székesfehérvár", "Szombathely", "Szolnok", "Tatabánya", "Kaposvár", "Érd", "Veszprém"],
  },
  {
    name: "Czech Republic",
    code: "CZ",
    phoneCode: "+420",
    cities: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem", "Hradec Králové", "České Budějovice", "Pardubice", "Zlín", "Havířov", "Kladno", "Most", "Opava"],
  },
  {
    name: "Slovakia",
    code: "SK",
    phoneCode: "+421",
    cities: ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica", "Trnava", "Martin", "Trenčín", "Poprad", "Piešťany", "Zvolen", "Považská Bystrica"],
  },
  {
    name: "Poland",
    code: "PL",
    phoneCode: "+48",
    cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Białystok", "Katowice", "Gdynia", "Częstochowa", "Radom", "Sosnowiec", "Toruń", "Kielce", "Rzeszów"],
  },
  {
    name: "France",
    code: "FR",
    phoneCode: "+33",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne", "Le Havre", "Toulon", "Grenoble", "Dijon", "Angers"],
  },
  {
    name: "Spain",
    code: "ES",
    phoneCode: "+34",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada"],
  },
  {
    name: "Portugal",
    code: "PT",
    phoneCode: "+351",
    cities: ["Lisbon", "Porto", "Braga", "Amadora", "Almada", "Coimbra", "Funchal", "Setúbal", "Vila Nova de Gaia", "Aveiro", "Évora", "Faro", "Viseu", "Leiria"],
  },
  {
    name: "United Kingdom",
    code: "GB",
    phoneCode: "+44",
    cities: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh", "Bristol", "Cardiff", "Leicester", "Nottingham", "Newcastle", "Belfast", "Brighton", "Oxford", "Cambridge"],
  },
  {
    name: "Ireland",
    code: "IE",
    phoneCode: "+353",
    cities: ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords", "Bray", "Navan", "Kilkenny", "Ennis", "Tralee", "Carlow"],
  },
  {
    name: "Netherlands",
    code: "NL",
    phoneCode: "+31",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen", "Haarlem", "Arnhem", "Enschede", "Amersfoort"],
  },
  {
    name: "Belgium",
    code: "BE",
    phoneCode: "+32",
    cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven", "Mons", "Mechelen", "Aalst", "Hasselt", "Kortrijk", "Ostend"],
  },
  {
    name: "Sweden",
    code: "SE",
    phoneCode: "+46",
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Borås"],
  },
  {
    name: "Norway",
    code: "NO",
    phoneCode: "+47",
    cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Sandnes", "Tromsø", "Sarpsborg", "Bodø", "Sandefjord", "Ålesund"],
  },
  {
    name: "Denmark",
    code: "DK",
    phoneCode: "+45",
    cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde", "Herning", "Silkeborg", "Næstved", "Fredericia"],
  },
  {
    name: "Finland",
    code: "FI",
    phoneCode: "+358",
    cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio", "Kouvola", "Pori", "Joensuu", "Lappeenranta", "Hämeenlinna"],
  },
  {
    name: "United States",
    code: "US",
    phoneCode: "+1",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Indianapolis", "San Francisco", "Seattle", "Denver", "Washington DC", "Nashville", "Oklahoma City", "Boston", "Las Vegas", "Miami", "Atlanta"],
  },
  {
    name: "Canada",
    code: "CA",
    phoneCode: "+1",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London", "Halifax", "Victoria", "Oshawa", "Windsor"],
  },
  {
    name: "Australia",
    code: "AU",
    phoneCode: "+61",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Hobart", "Geelong", "Townsville", "Cairns", "Darwin"],
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    phoneCode: "+971",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain"],
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    phoneCode: "+966",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha", "Taif", "Buraidah", "Najran", "Jubail", "Yanbu", "Hail"],
  },
];
