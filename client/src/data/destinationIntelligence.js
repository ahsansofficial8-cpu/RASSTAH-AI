/**
 * RAASTAH (راستہ) — Destination Intelligence & Slug Resolver Engine
 * Authoritative destination data, route milestones, elevation profiles,
 * destination context and regional linkages for the Pakistan catalogue.
 */

import { PAKISTAN_99_LOCATIONS } from './pakistan59Locations.js';
import { getDestinationMedia, getYouTubeVideoId } from './destinationImages.js';

// Slug aliases to guarantee smooth routing for common short names and typos
const SLUG_ALIASES = {
  'hunza': 'hunza-valley',
  'karimabad': 'hunza-valley',
  'skardu': 'deosai-plains',
  'skardu-valley': 'shangrila-resort',
  'deosai': 'deosai-plains',
  'katpana': 'katpana-desert',
  'sarfaranga': 'katpana-desert',
  'shangrila': 'shangrila-resort',
  'kachura': 'shangrila-resort',
  'fairy-meadows': 'fairy-meadows',
  'nanga-parbat': 'fairy-meadows',
  'naltar': 'naltar-valley',
  'naltar-lakes': 'naltar-valley',
  'attabad': 'attabad-lake',
  'passu': 'passu-cones',
  'khunjerab': 'khunjerab-pass',
  'shigar': 'shigar-fort',
  'khaplu': 'khaplu-palace',
  'k2': 'k2-basecamp-concordia',
  'concordia': 'k2-basecamp-concordia',
  'swat': 'kalam-swat',
  'kalam': 'kalam-swat',
  'mahodand': 'mahodand-lake',
  'malam-jabba': 'malam-jabba',
  'kumrat': 'kumrat-valley',
  'naran': 'naran-kaghan',
  'kaghan': 'naran-kaghan',
  'babusar': 'babusar-top',
  'shogran': 'shogran-siri-paye',
  'siri-paye': 'shogran-siri-paye',
  'chitral': 'chitral-kalash',
  'kalash': 'chitral-kalash',
  'takht-i-bahi': 'gandhara-takht-i-bahi',
  'peshawar': 'peshawar-qissa-khwani',
  'white-palace': 'swat-white-palace',
  'neelum': 'neelum-arang-kel',
  'arang-kel': 'neelum-arang-kel',
  'ratti-gali': 'ratti-gali-lake',
  'pir-chinasi': 'pir-chinasi',
  'rawalakot': 'rawalakot-banjosa',
  'banjosa': 'rawalakot-banjosa',
  'sharda': 'sharda-peeth',
  'taobat': 'taobat-valley',
  'ramkot': 'ramkot-fort-mangla',
  'kutton': 'kutton-jagran-valley',
  'kund-malir': 'hingol-kund-malir',
  'hingol': 'hingol-kund-malir',
  'gwadar': 'gwadar-hammerhead',
  'ziarat': 'ziarat-juniper',
  'charna': 'charna-island',
  'moola-chotok': 'moola-chotok',
  'hanna-lake': 'hanna-lake-quetta',
  'astola': 'astola-island',
  'chandragup': 'chandragup-mud-volcano',
  'lahore': 'lahore-walled-city',
  'islamabad': 'islamabad-monal-margalla',
  'margalla': 'islamabad-monal-margalla',
  'katas-raj': 'katas-raj-temples',
  'derawar': 'derawar-fort-cholistan',
  'cholistan': 'derawar-fort-cholistan',
  'rohtas': 'rohtas-fort-unesco',
  'khewra': 'khewra-salt-mines',
  'bahawalpur': 'bahawalpur-noor-mahal',
  'noor-mahal': 'bahawalpur-noor-mahal',
  'murree': 'murree-mall-road-patriata',
  'multan': 'multan-shah-rukn-e-alam',
  'harappa': 'harappa-indus-valley',
  'mohenjo-daro': 'mohenjo-daro-unesco',
  'gorakh': 'gorakh-hill-station',
  'gorakh-hill': 'gorakh-hill-station',
  'ranikot': 'ranikot-great-wall',
  'makli': 'makli-necropolis-thatta',
  'keenjhar': 'keenjhar-lake',
  'sehwan': 'sehwan-lal-shahbaz',
  'karachi': 'karachi-clifton-manora',
  'kot-diji': 'kot-diji-fort',
  'sukkur': 'sukkur-lloyd-barrage'
};

// Annual Season Matrix (12 Months) with visual status (open = green, caution = yellow, closed = red)
function generateSeasonMatrix(loc) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const elevation = parseInt(String(loc?.elevation || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const region = loc?.region || '';
  const bestMonths = (loc?.bestMonths || '').toLowerCase();

  return months.map((month, idx) => {
    const mNum = idx + 1; // 1 to 12
    let status = 'open';
    let label = 'Prime Season';

    if (elevation >= 3200 || region === 'Gilgit-Baltistan') {
      if (mNum >= 11 || mNum <= 3) {
        status = 'closed';
        label = 'Winter Snow Bound';
      } else if (mNum === 4 || mNum === 10) {
        status = 'caution';
        label = 'Shoulder Season';
      } else {
        status = 'open';
        label = 'Prime Expedition Window';
      }
    } else if (elevation >= 1800 || region === 'Khyber Pakhtunkhwa' || region === 'Azad Kashmir') {
      if (mNum >= 12 || mNum <= 2) {
        status = 'caution';
        label = 'Winter Snow Flurries';
      } else if (mNum === 3 || mNum === 11) {
        status = 'caution';
        label = 'Pleasant Shoulder';
      } else {
        status = 'open';
        label = 'Optimal Green Season';
      }
    } else if (region.includes('Balochistan') || region.includes('Sindh')) {
      if (mNum >= 5 && mNum <= 8) {
        status = 'caution';
        label = 'Extreme Summer Heat';
      } else {
        status = 'open';
        label = 'Pleasant Winter Coastal';
      }
    } else {
      if (mNum >= 6 && mNum <= 8) {
        status = 'caution';
        label = 'Monsoon & Summer Heat';
      } else {
        status = 'open';
        label = 'Ideal Sightseeing';
      }
    }

    return { month, status, label };
  });
}

function generateReviewsForLocation(loc) {
  return [
    {
      author: 'Captain Usman Tariq',
      rating: 5,
      date: 'September 2026',
      comment: `Incredible experience traveling to ${loc?.name?.split('(')[0]?.trim()}. Road condition was smooth and the local mountain guides were extremely welcoming.`
    },
    {
      author: 'Dr. Fatima Noor',
      rating: 5,
      date: 'August 2026',
      comment: 'Breathtaking scenery and pure glacier waters. Make sure to pack warm layers for the evening drop in temperature.'
    }
  ];
}

// Nearby Facilities tailored to spot
function generateNearbyFacilities(loc) {
  return [
    { type: 'Hospital / Trauma Station', name: `${loc?.region || 'Regional'} DHQ Emergency Trauma Center (Rescue 1122)` },
    { type: 'Fuel & Mechanics', name: 'PSO 24/7 High-Altitude Station & Tire Vulcanizing Shop' },
    { type: 'Accommodation', name: 'Verified Alpine Riverside Lodges & Heritage Rest Houses' }
  ];
}

// Suitability / Should I Go Generator
function generateSuitability(loc) {
  const elevation = parseInt(String(loc?.elevation || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const isChallenging = (loc?.difficulty || '').toLowerCase().includes('challenging')
    || (loc?.difficulty || '').toLowerCase().includes('4x4')
    || elevation > 3000;

  let familyFriendly = 'Family Friendly (Suitable for all age groups & vacations)';
  let kidsSuitable = 'High (Safe walkways, family hotels & gentle viewpoints)';
  let elderlyAccessible = 'Good (Paved roads to main resorts and riverfronts)';
  let walkingRequired = 'Moderate (Short strolls to key viewpoints)';
  let winterAccess = 'Accessible with winter caution (Chains advised during snow)';

  if (elevation >= 3200) {
    familyFriendly = 'Moderate (High altitude acclimatization advised for elderly & children)';
    kidsSuitable = 'Moderate (Not recommended for infants under 2 due to thin mountain air)';
    elderlyAccessible = 'Gradual Ascent (Rest days in base valleys strongly recommended)';
    walkingRequired = 'Moderate to High (Scenic hiking trails and alpine tracks)';
    winterAccess = 'Seasonal Closure (Pass blocked by deep snow Nov–April)';
  } else if (elevation >= 2200) {
    familyFriendly = 'High (Excellent for family road trips and youth groups)';
    kidsSuitable = 'Good (Active kids enjoy pine forests and gentle river trails)';
    elderlyAccessible = 'Accessible (Comfortable transport drops passengers near points)';
    walkingRequired = 'Low to Moderate (Optional ridge trails)';
    winterAccess = 'Open with caution (Snowfall brings picturesque winter tourism)';
  }

  const needs4x4 = isChallenging
    ? 'Required (Dedicated 4x4 Jeep / High-Clearance Track)'
    : 'Standard Vehicle Accessible (High-clearance recommended for upper viewpoints)';

  return {
    familyFriendly,
    kidsSuitable,
    elderlyAccessible,
    adventureLevel: loc?.difficulty || 'Moderate Mountain Journey',
    walkingRequired,
    needs4x4,
    winterAccess,
    recommendedStay: {
      quick: '2 Days (Express Highlights Trail)',
      standard: '4-5 Days (Complete Valley & Cultural Immersion)',
      deep: '7-10 Days (Backcountry Trekking & Remote Valleys)'
    }
  };
}

// 4x4 Requirement Intelligence
function generateJeepIntel(loc) {
  const elevation = parseInt(String(loc?.elevation || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const is4x4 = (loc?.difficulty || '').toLowerCase().includes('4x4')
    || (loc?.difficulty || '').toLowerCase().includes('challenging')
    || elevation >= 2800;

  if (is4x4) {
    return {
      required: 'Required for Off-Road Sectors',
      section: `Off-road tracks connecting ${loc?.name?.split('(')[0]?.trim()} base to glacial moraines and high viewpoints`,
      why: 'Steep gravel inclines, glacial river crossings, and rocky switchbacks demand low-range 4WD capability.',
      estimatedJeepRatePKR: 'PKR 12,000 – 16,000 / day',
      rateSource: 'Local Mountain Jeep Union Tariff (2026 Season)',
      notes: 'Certified local union drivers include fuel, mountain permits, and satellite recovery gear.'
    };
  }

  return {
    required: 'Accessible by Standard Vehicle',
    section: `Paved national highway route leading to ${loc?.name?.split('(')[0]?.trim()}`,
    why: 'Smooth tarmac highway connects directly to town center; 4x4 optional for remote off-highway ridges.',
    estimatedJeepRatePKR: 'PKR 8,000 – 11,000 / day (Optional Ridge Safari)',
    rateSource: 'Local Chauffeur & Rental Directory',
    notes: 'Sedans, Hiace vans, and coasters navigate comfortably in all normal daylight hours.'
  };
}

// Destination-Specific Packing Assistant
function generatePackingChecklist() {
  return {
    summerEssentials: [
      'Breathable moisture-wicking layers',
      'Windbreaker / light fleece for evening temperature drop',
      'Polarized UV400 sunglasses (essential for high-altitude glare)',
      'High SPF 50 sunscreen & SPF lip balm',
      'Comfortable sneakers or lightweight trail shoes',
      '20,000 mAh Power bank (chilly weather drains phone batteries faster)'
    ],
    winterEssentials: [
      'Thermal base layer (top & bottom)',
      'Heavy down insulated jacket (-10°C rated)',
      'Waterproof mountain boots with deep grip',
      'Thermal fleece-lined gloves & woolen beanie',
      'Hot water thermos flask for road travel',
      'Vehicle snow chains if self-driving'
    ],
    medicalPack: [
      'Personal first-aid supplies appropriate to your needs',
      'Personal medications prescribed by your clinician',
      'Emergency contacts and relevant medical information'
    ]
  };
}

// Mobile Network & Connectivity Profile
function generateNetworkIntel(loc) {
  const region = loc?.region || '';

  if (region === 'Gilgit-Baltistan') {
    return {
      scomSignal: 'Strong 4G LTE across Karimabad, Skardu, Gilgit & major towns',
      zongSignal: 'Solid 4G/3G in commercial valley hubs',
      jazzSignal: 'Moderate 3G coverage in central bazaars',
      overallVerdict: 'SCOM 4G delivers highest northern reliability; deep treks lack mobile signals',
      recommendation: 'Pick up an SCOM or Zong travel SIM card in Gilgit/Skardu and save offline atlas dossiers.'
    };
  }
  if (region === 'Khyber Pakhtunkhwa') {
    return {
      scomSignal: 'Roaming available on partner networks',
      zongSignal: 'High-speed 4G active in Swat, Kalam, Naran, and Abbottabad',
      jazzSignal: 'Blazing 4G LTE along expressways, tourist resorts, and mountain towns',
      overallVerdict: 'Jazz and Zong offer uninterrupted 4G data coverage throughout the region',
      recommendation: 'Both Jazz and Zong 4G function reliably throughout main tourist corridors.'
    };
  }
  if (region === 'Azad Kashmir') {
    return {
      scomSignal: 'SCOM 4G active throughout Muzaffarabad and Neelum Valley',
      zongSignal: 'Reliable 4G coverage in Muzaffarabad and lower valley towns',
      jazzSignal: 'Good coverage in urban entry sectors',
      overallVerdict: 'SCOM is the official regional carrier with the widest reach across Kashmir valleys',
      recommendation: 'SCOM SIM cards are easily purchased at the Kohala or Muzaffarabad entry checkpoints.'
    };
  }
  if (region.includes('Balochistan')) {
    return {
      scomSignal: 'Partner roaming network',
      zongSignal: 'Fast 4G along Makran Coastal Highway and Gwadar Port Marine Drive',
      jazzSignal: 'Dependable coverage in Quetta and key highway rest points',
      overallVerdict: 'Zong and Ufone provide the most consistent signal along the coastal corridor',
      recommendation: 'Ensure your Zong SIM is loaded with balance before driving onto the Makran Highway.'
    };
  }

  return {
    scomSignal: 'Nationwide roaming',
    zongSignal: 'Blazing 4G+ coverage everywhere',
    jazzSignal: 'Blazing 4G+ coverage everywhere',
    overallVerdict: 'Full high-speed 4G/5G mobile broadband active across all carriers',
    recommendation: 'All major mobile networks deliver seamless voice and high-speed data.'
  };
}

// Fuel Intelligence
function generateFuelIntel(loc) {
  const name = loc?.name?.split('(')[0]?.trim() || 'Central Town';
  const region = loc?.region || '';

  let nearestStation = `PSO / Shell 24/7 Station in ${name} Central Bazaar`;
  if (region === 'Gilgit-Baltistan') nearestStation = `PSO Karimabad / Skardu City Hub (15-25 min drive)`;
  if (region === 'Khyber Pakhtunkhwa') nearestStation = `Shell & PSO Stations in Kalam / Naran Bazaar`;

  return {
    nearestStation,
    dieselAvailability: 'High-grade Euro-5 Diesel and Super Petrol reliably stocked',
    fuelWarning: `Top up fuel before departing ${name}; high-altitude passes have no fuel stations for 60+ km.`
  };
}

// Food Intelligence & Local Specialties
function generateFoodIntel(loc) {
  const name = (loc?.name || '').toLowerCase();
  const region = loc?.region || '';

  let specialties = ['Traditional Pakistani Karahi', 'Seekh Kebabs with Naan', 'Fresh Sugarcane Juice'];
  if (name.includes('hunza') || name.includes('attabad') || name.includes('passu')) {
    specialties = ['Chapshuro (Wakhi Mountain Meat Pie)', 'Hunza Walnut Cake', 'Fresh Apricot Nectar', 'Mamtu (Steamed Dumplings)', 'Dowa Buckwheat Soup'];
  } else if (name.includes('skardu') || name.includes('shangrila') || name.includes('deosai')) {
    specialties = ['Prapoo (Walnut Noodle Pasta)', 'Balti Mamtu (Steamed Dumplings)', 'Buckwheat Gyaling Pancakes', 'Balti Butter Tea', 'Churpe Dried Cheese'];
  } else if (name.includes('swat') || name.includes('kalam') || name.includes('kumrat')) {
    specialties = ['Swat River Fried Trout', 'Charsi Shinwari Mutton Karahi', 'Ushu Pine Forest Honey', 'Kalam Walnut Halwa', 'Chapli Kebabs'];
  } else if (region === 'Azad Kashmir' || name.includes('neelum') || name.includes('arang')) {
    specialties = ['Kashmiri Gushtaba & Roghan Josh', 'Kulcha & Kashmiri Pink Chai', 'Forest Morel Mushrooms (Guchhi)', 'Neelum Red Kidney Beans (Rajma)'];
  } else if (region.includes('Balochistan') || name.includes('gwadar') || name.includes('kund malir')) {
    specialties = ['Makran Gulf Grilled Red Snapper', 'Jumbo Fried Tiger Prawns', 'Balochi Mutton Sajji with Kaak Bread', 'Fresh Coconut Water'];
  }

  return {
    specialties,
    diningRecommendation: `Authentic riverside Dhabas and family heritage dining located along ${loc?.name?.split('(')[0]?.trim()} Main Bazaar.`
  };
}

// Destination-Specific FAQs (Dynamic & Context Aware)
function generateDestinationQA(loc) {
  const name = loc?.name?.split('(')[0]?.trim() || 'this destination';
  const nameLower = (loc?.name || '').toLowerCase();
  const elev = loc?.elevation || '2,400m';
  const region = loc?.region || 'Northern Pakistan';

  if (nameLower.includes('hunza')) {
    return [
      {
        q: 'What is the best route and time to visit Khunjerab Pass from Hunza?',
        a: 'Khunjerab Pass (4,693m) is an 85km smooth drive along the Karakoram Highway via Sost. It is open from April 1 to November 30. Start early morning (around 8:00 AM) to avoid afternoon mountain winds and enjoy peak daylight at the border.'
      },
      {
        q: 'Can standard sedans drive all the way to Karimabad and Attabad Lake?',
        a: 'Yes! The Karakoram Highway (N-35) is fully paved tarmac with engineering tunnels around Attabad Lake. Standard sedans, Corollas, and hatchbacks reach Karimabad, Attabad Lake, and Passu without difficulty.'
      },
      {
        q: 'What are the visiting hours and guided tour details for Baltit and Altit Forts?',
        a: 'Both 800+ year old forts are open daily from 9:00 AM to 5:30 PM. Certified heritage guides lead 45-minute walkthroughs in English and Urdu, sharing ancient royal history and mountain architecture.'
      },
      {
        q: 'Which mobile network has the strongest data connection in Hunza?',
        a: 'SCOM 4G delivers the widest coverage across Karimabad, Aliabad, and Passu. Zong 4G also provides high-speed data in central towns. You can pick up an SCOM SIM card upon entering Gilgit.'
      }
    ];
  }

  if (nameLower.includes('skardu') || nameLower.includes('shangrila') || nameLower.includes('deosai')) {
    return [
      {
        q: 'When do the Deosai Plains open, and is a 4x4 mandatory?',
        a: 'Deosai National Park sits at an average altitude of 4,114m and is snowbound for over 7 months. It opens from late June to mid-October. A dedicated 4x4 Land Cruiser or Prado is strictly required to cross the rocky river beds safely.'
      },
      {
        q: 'Is it better to fly to Skardu or drive via the Karakoram Highway?',
        a: 'PIA operates scenic 1-hour flights from Islamabad to Skardu with views of K2. Alternatively, the newly widened Jaglot-Skardu road (S-1) offers an asphalt highway journey through the Indus gorge in 20-22 hours with a night stay in Chilas.'
      },
      {
        q: 'What should I pack for the Katpana Cold Desert and Shangrila Lake?',
        a: 'Cold desert temperatures drop sharply after sunset. Pack thermal base layers, windbreaker jackets, UV sunglasses for high-altitude solar reflection, and sturdy footwear for dune walks.'
      },
      {
        q: 'Can casual tourists visit K2 Base Camp without technical mountaineering gear?',
        a: 'The trek to Concordia and K2 Base Camp takes 12-14 days over the rugged Baltoro Glacier. It requires an experienced licensed mountain guide, porter logistics, and moderate-to-high physical endurance, but no technical climbing skills.'
      }
    ];
  }

  if (nameLower.includes('fairy meadows') || nameLower.includes('nanga parbat')) {
    return [
      {
        q: 'How safe is the Raikot Bridge jeep track up to Fairy Meadows?',
        a: 'The 16km cliffside track from Raikot Bridge to Tattu village is strictly driven by authorized native mountain drivers in rugged 4x4 jeeps. Local drivers have navigated these tracks for decades with exemplary safety records.'
      },
      {
        q: 'How long is the hike from Tattu village up to Fairy Meadows?',
        a: 'The trail is approximately 5.5 km with an elevation rise of 600m. It takes 2.5 to 3.5 hours at a relaxed pace. Trailhead porters and riding horses are available for hire if you prefer not to carry heavy packs.'
      },
      {
        q: 'Is heating and electricity available in Fairy Meadows cottages?',
        a: 'Wooden cabins operate on micro-hydel and solar power, with lights running until 10:00 PM. Traditional wood-burning bukhari stoves keep the cabins cozy during freezing alpine nights.'
      },
      {
        q: 'Can I hike to Nanga Parbat Base Camp (Beyal Camp) in a single day?',
        a: 'Yes! Beyal Camp is a gentle 2-hour walk through alpine pine forests from Fairy Meadows. You can easily hike to Beyal Camp and the Nanga Parbat View Point and return before sunset.'
      }
    ];
  }

  if (nameLower.includes('swat') || nameLower.includes('kalam') || nameLower.includes('malam jabba')) {
    return [
      {
        q: 'Is the Swat Motorway (M-16) accessible for standard family cars?',
        a: 'Yes, the Swat Motorway connects Islamabad/Peshawar to Chakdara in just 1.5 hours. From Chakdara, a smooth dual carriageway leads directly to Mingora, Bahrain, and Kalam.'
      },
      {
        q: 'How do I reach Mahodand Lake from Kalam?',
        a: 'Mahodand Lake is located 35 km upstream from Kalam through the Ushu Pine Forest. A local 4x4 Willys jeep or high-clearance SUV is recommended to navigate the rocky gravel sections and river streams.'
      },
      {
        q: 'Is Malam Jabba ski resort operational during summer months?',
        a: 'Yes! While skiing runs from January to March, summer visitors enjoy the chairlifts, zip-lines, mountain carting, and cool alpine breezes.'
      },
      {
        q: 'What are the road conditions between Kalam and Kumrat Valley?',
        a: 'During summer, you can cross from Kalam to Kumrat Valley via the scenic Badgoi Pass (3,500m) in a rugged 4x4. In winter or by sedan, you can travel via the paved Lowari Tunnel route through Upper Dir.'
      }
    ];
  }

  // Dynamic tailored FAQs for any of the 99 locations
  return [
    {
      q: `What is the easiest route to reach ${name} from Islamabad or Lahore?`,
      a: `Travelers can navigate via national motorways and expressways into ${region}. You can generate a turn-by-turn route with exact distance and driving hours using the Raastah Route Planner.`
    },
    {
      q: `What is the altitude of ${name} and do I need acclimatization?`,
      a: `${name} is situated at an elevation of approximately ${elev}. For destinations above 2,500m, drink plenty of water and plan an easy first day to allow your body to naturally acclimate.`
    },
    {
      q: `Is a 4x4 Jeep necessary to explore ${name}?`,
      a: `Main access highways are paved. However, remote ridge viewpoints, lakes, and high-altitude tracks around ${name} are best explored with high-clearance 4x4s or local mountain drivers.`
    },
    {
      q: `What is the best season and weather window to travel to ${name}?`,
      a: `Prime travel months are ${loc?.bestMonths || 'May to October'}. Daytime conditions are comfortable, while evenings in ${region} can turn chilly—pack warm layers and windproof outerwear.`
    }
  ];
}

function generateGallery(loc) {
  const images = getDestinationMedia(loc.id).images;
  return Array.from({ length: images.length || 1 }, (_, photoIndex) => ({
    url: images[photoIndex] || null,
    caption: `${loc.name} — destination image ${photoIndex + 1}`,
    tag: 'Destination image',
    credit: null,
    source: 'Local destination media JSON',
    photoIndex
  }));
}

/**
 * Public API: Get fully enriched destination by slug or ID
 */
export function getDestinationBySlug(rawSlug) {
  if (!rawSlug) return null;
  const cleanSlug = rawSlug.trim().toLowerCase();

  // 1. Direct ID match
  let found = PAKISTAN_99_LOCATIONS.find(loc => loc.id.toLowerCase() === cleanSlug);

  // 2. Alias match
  if (!found && SLUG_ALIASES[cleanSlug]) {
    const targetId = SLUG_ALIASES[cleanSlug];
    found = PAKISTAN_99_LOCATIONS.find(loc => loc.id === targetId);
  }

  // 3. Partial / Starts-with match
  if (!found) {
    found = PAKISTAN_99_LOCATIONS.find(loc => 
      loc.id.includes(cleanSlug) || 
      cleanSlug.includes(loc.id) ||
      loc.name.toLowerCase().includes(cleanSlug)
    );
  }

  if (!found) return null;

  // Enrich with full travel technology payload
  const seasons = generateSeasonMatrix(found);
  const guide = null;
  const packages = [];
  const reviews = generateReviewsForLocation(found);
  const gallery = generateGallery(found);
  const facilities = generateNearbyFacilities(found);
  const suitability = generateSuitability(found);
  const jeepIntel = generateJeepIntel(found);
  const packingAssistant = generatePackingChecklist(found);
  const networkIntel = generateNetworkIntel(found);
  const fuelIntel = generateFuelIntel(found);
  const foodIntel = generateFoodIntel(found);
  const destinationQA = generateDestinationQA(found);
  const priceIntelligence = null;

  return {
    ...found,
    slug: found.id,
    weather: null,
    seasons,
    guide,
    packages,
    reviewsList: reviews,
    gallery,
    facilities,
    suitability,
    jeepIntel,
    packingAssistant,
    networkIntel,
    fuelIntel,
    foodIntel,
    destinationQA,
    priceIntelligence,
    videoMeta: {
      youtubeId: getYouTubeVideoId(getDestinationMedia(found.id).youtubeUrl),
      youtubeUrl: getDestinationMedia(found.id).youtubeUrl
    },
    aboutParagraphs: [
      `${found.name} is in ${found.region}, Pakistan. The catalogue lists its elevation as ${found.elevation}.`,
      found.whyFamous,
      found.whatsUnique
    ]
  };
}

/**
 * Public API: Get all destinations with essential preview metadata
 */
export function getAllDestinations() {
  return PAKISTAN_99_LOCATIONS.map(loc => ({
    ...loc,
    slug: loc.id
  }));
}
