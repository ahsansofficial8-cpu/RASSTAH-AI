/**
 * ==============================================================================
 * RAASTAH (راستہ) — EXPEDITIONS & TOUR PACKAGES
 * Curated, high-fidelity Pakistani tour packages with full itinerary details,
 * verified operator badges, inclusions, and real-world pricing.
 * ==============================================================================
 */

export const TOUR_PACKAGES = [
  {
    id: 'hunza-khunjerab-expedition',
    title: '7-Day Hunza & Khunjerab Frontier Expedition',
    tagline: 'Journey through the Karakoram Highway to the world\'s highest paved border pass.',
    destinationId: 'hunza-valley',
    region: 'Gilgit-Baltistan',
    durationDays: 7,
    durationNights: 6,
    pricePKR: 85000,
    priceUSD: 305,
    rating: 4.9,
    reviewsCount: 128,
    difficulty: 'Moderate',
    groupSize: '4 - 12 Travelers',
    departureLocation: 'Islamabad / Gilgit',
    featured: true,
    operator: {
      name: 'Karakoram High-Altitude Expeditions',
      badge: 'Certified Alpine Operator',
      contact: '+92 300 5551234',
      rating: 4.9
    },
    highlights: [
      'Scenic drive along the legendary Karakoram Highway (KKH)',
      'Boat excursion across Attabad turquoise glacial lake',
      'Walk the suspension bridge of Hussaini over Hunza River',
      'Climb to 4,693m at Khunjerab Pass (Pakistan-China Border)',
      'Sunset tea atop Eagle\'s Nest overlooking Rakaposhi (7,788m)',
      'Explore 1000-year-old Baltit and Altit Forts'
    ],
    inclusions: [
      'Dedicated 4x4 Prado / Hiace Grand Cabin with fuel & tolls',
      '6 nights accommodation in premium local alpine lodges',
      'Daily breakfast & traditional mountain dinners',
      'Government licensed high-altitude guide & driver',
      'Khunjerab National Park & Fort entrance permits',
      'Emergency oxygen kit and basic first-aid support'
    ],
    exclusions: [
      'Domestic flights to Gilgit (optional add-on)',
      'Personal trekking gear & personal shopping',
      'Travel insurance & tips'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Islamabad to Naran / Chilas',
        desc: 'Depart early morning via Hazara Motorway. Ascend Babusar Pass (4,173m) with panoramic views into Chilas valley.'
      },
      {
        day: 2,
        title: 'Chilas to Karimabad, Hunza Valley',
        desc: 'Confluence of 3 great mountain ranges (Himalayas, Karakoram, Hindukush). Check in to Karimabad hotel with views of Rakaposhi.'
      },
      {
        day: 3,
        title: 'Baltit Fort, Altit Fort & Eagle\'s Nest',
        desc: 'Guided tour of historical Baltit and Altit Forts. Evening drive to Eagle\'s Nest Duikar for a golden hour 360-degree sunset.'
      },
      {
        day: 4,
        title: 'Attabad Lake & Passu Cones',
        desc: 'Boat cruise on turquoise Attabad Lake. Walk the thrilling Hussaini suspension bridge and marvel at the cathedral Passu Cones.'
      },
      {
        day: 5,
        title: 'Khunjerab Pass & Border Post (4,693m)',
        desc: 'Drive through Khunjerab National Park. Spot Himalayan Ibex and reach the world\'s highest ATM and Pakistan-China border gateway.'
      },
      {
        day: 6,
        title: 'Hunza to Gilgit & Naran',
        desc: 'Begin descent via Gilgit city, shopping in local dry fruit bazaars, before continuing across the mountain passes.'
      },
      {
        day: 7,
        title: 'Return to Islamabad',
        desc: 'Return to Islamabad via Abbottabad motorway. Drop-off at Islamabad International Airport or designated hotel.'
      }
    ]
  },
  {
    id: 'skardu-deosai-safari',
    title: '8-Day Skardu Valley & Deosai Plains 4x4 Safari',
    tagline: 'Land of Giants, cold deserts, alpine lakes, and ancient Tibetan palaces.',
    destinationId: 'skardu-valley',
    region: 'Gilgit-Baltistan',
    durationDays: 8,
    durationNights: 7,
    pricePKR: 110000,
    priceUSD: 395,
    rating: 4.95,
    reviewsCount: 94,
    difficulty: 'Moderate - Challenging',
    groupSize: '4 - 8 Travelers',
    departureLocation: 'Islamabad / Skardu Airport',
    featured: true,
    operator: {
      name: 'Baltistan 4x4 Explorers Club',
      badge: 'Registered Wilderness Guide',
      contact: '+92 312 8884321',
      rating: 5.0
    },
    highlights: [
      'Traverse the Deosai National Park — world\'s 2nd highest plateau (4,114m)',
      'Camp or stargaze at Sheosar crystal emerald lake',
      'Experience Sarfaranga & Katpana high-altitude cold deserts',
      'Visit Upper & Lower Kachura (Shangrila) Lakes',
      'Tour historic 17th-century Shigar Fort & Khaplu Palace',
      'Glimpse K2 view points along the mighty Indus gorge'
    ],
    inclusions: [
      'Heavy-duty 4WD Toyota Land Cruiser throughout Baltistan',
      '7 nights accommodation in heritage fort-palaces & luxury camps',
      'All meals (Breakfast, lunch picnic, traditional Balti dinner)',
      'Deosai Wildlife Park entry passes & camping equipment',
      'Experienced mountain guide & certified mechanic driver',
      'Satellite phone communication link for emergencies'
    ],
    exclusions: [
      'Air tickets to Skardu',
      'Personal thermal outerwear',
      'Gratuities and personal expenses'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Skardu & Kachura Lakes',
        desc: 'Flight or road arrival in Skardu. Relaxation at Shangrila Resort and hike around Lower Kachura and Upper Kachura Lake.'
      },
      {
        day: 2,
        title: 'Sarfaranga Cold Desert & Shigar Fort',
        desc: 'Drive across the world\'s highest cold sand dunes in Sarfaranga. Tour the Serena Shigar Fort, a restored 400-year-old palace.'
      },
      {
        day: 3,
        title: 'Khaplu Valley & Chaqchan Mosque',
        desc: 'Visit Khaplu Palace and the 700-year-old wooden Chaqchan Mosque, blending Kashmiri and Tibetan architecture.'
      },
      {
        day: 4,
        title: 'Ascent to Deosai National Park',
        desc: 'Climb via Sadpara Lake into the vast Deosai plateau. Search for Himalayan Brown Bears and setup near Sheosar Lake.'
      },
      {
        day: 5,
        title: 'Sheosar Lake & Bara Pani',
        desc: 'Breathtaking reflections of Nanga Parbat across Sheosar Lake. Cross suspension bridges over Bara Pani river.'
      },
      {
        day: 6,
        title: 'Manthoka Waterfall & Indus Confluence',
        desc: 'Descend back toward Skardu and visit the roaring 180-foot Manthoka Waterfall cascading over granite cliffs.'
      },
      {
        day: 7,
        title: 'Kharpocho Fort Hike & Skardu Bazaar',
        desc: 'Morning trek to ancient Kharpocho Fort overlooking the entire Skardu valley and Indus River. Free evening for gem shopping.'
      },
      {
        day: 8,
        title: 'Departure from Skardu',
        desc: 'Morning transfer to Skardu Airport or departure road journey back to Islamabad.'
      }
    ]
  },
  {
    id: 'fairy-meadows-nanga-parbat',
    title: '5-Day Fairy Meadows & Nanga Parbat Base Camp Trek',
    tagline: 'Stand before the legendary 8,126m Killer Mountain from alpine wildflower meadows.',
    destinationId: 'fairy-meadows',
    region: 'Gilgit-Baltistan',
    durationDays: 5,
    durationNights: 4,
    pricePKR: 65000,
    priceUSD: 235,
    rating: 4.88,
    reviewsCount: 86,
    difficulty: 'Adventurous',
    groupSize: '2 - 10 Travelers',
    departureLocation: 'Islamabad / Raikot Bridge',
    featured: true,
    operator: {
      name: 'Diamer Mountain Guides Co.',
      badge: 'Licensed Mountaineering Crew',
      contact: '+92 345 7779012',
      rating: 4.8
    },
    highlights: [
      'Thrilling cliff-edge 4x4 mountain jeep safari from Raikot Bridge',
      'Hike through pine forests to the magical Fairy Meadows',
      'Camp with unobstructed views of Nanga Parbat (8,126m) Raikot Face',
      'Trek to Beyal Camp and the edge of Raikot Glacier',
      'Warm campfires with traditional mountain folklore and local tea'
    ],
    inclusions: [
      'Round-trip 4x4 mountain jeep from Raikot Bridge to Tattu village',
      'Porter service for main expedition luggage during hike',
      'Wooden alpine cottage stay at Fairy Meadows',
      'Professional mountain trekking guide',
      'Full-board meals and warm bonfire nights',
      'Nanga Parbat National Park access fees'
    ],
    exclusions: [
      'Pony hire for personal riding (available on request)',
      'Warm sleeping bags & trekking poles',
      'Snacks & personal beverages'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Islamabad to Raikot Bridge & Chilas',
        desc: 'Scenic drive up the Karakoram Highway via Babusar Pass to Raikot Bridge.'
      },
      {
        day: 2,
        title: 'Jeep Safari to Tattu & Trek to Fairy Meadows',
        desc: 'Board legendary local 4x4 jeeps on the thrilling mountain track. 3-hour gradual hike up to Fairy Meadows with Nanga Parbat rising ahead.'
      },
      {
        day: 3,
        title: 'Trek to Beyal Camp & Nanga Parbat View Point',
        desc: 'Hike through birch forests to Beyal Camp (3,500m) and onto the Raikot Glacier viewpoint for up-close icefall vistas.'
      },
      {
        day: 4,
        title: 'Sunrise Reflection & Hike Down to Tattu',
        desc: 'Catch golden morning alpine glow on Nanga Parbat. Hike down to Tattu, jeep back to Raikot, and overnight at Chilas.'
      },
      {
        day: 5,
        title: 'Return to Islamabad',
        desc: 'Drive back to Islamabad with scenic lunch stops along the Kunhar River.'
      }
    ]
  },
  {
    id: 'swat-kalam-kumrat-valley',
    title: '5-Day Swat Valley, Kalam & Kumrat Pine Forest Tour',
    tagline: 'Switzerland of the East: roaring rivers, deodar forests, and hidden waterfalls.',
    destinationId: 'kalam-swat',
    region: 'Khyber Pakhtunkhwa',
    durationDays: 5,
    durationNights: 4,
    pricePKR: 55000,
    priceUSD: 198,
    rating: 4.85,
    reviewsCount: 112,
    difficulty: 'Easy - Family Friendly',
    groupSize: '2 - 14 Travelers',
    departureLocation: 'Islamabad / Peshawar',
    featured: false,
    operator: {
      name: 'Swat Alpine Tours & Travels',
      badge: 'Verified Family Escort',
      contact: '+92 333 4448899',
      rating: 4.9
    },
    highlights: [
      'Malam Jabba Ski Resort & Chairlift over snowy pine ridges',
      'White Palace Marghazar built of pure Swat marble',
      'Kalam Valley and the roaring Panjkora & Swat River confluences',
      '4x4 expedition to Mahodand Glacial Lake & Saifullah Lake',
      'Dense towering deodar virgin forests of Kumrat Valley',
      'Katora Lake trail & majestic wooden mosques of Ushu'
    ],
    inclusions: [
      'AC Coaster / Grand Cabin transportation with dedicated driver',
      '4 nights hotel accommodation in Mingora and Kalam',
      'Daily breakfast & dinner included',
      '4x4 Jeep transfer to Mahodand Lake',
      'Malam Jabba entry and chairlift tickets',
      'Local Swati guide throughout the tour'
    ],
    exclusions: [
      'Lunch and mid-day snacks',
      'Zip-line and ski equipment rentals at Malam Jabba',
      'Personal horse rides at Mahodand Lake'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Islamabad to Swat Valley & Malam Jabba',
        desc: 'Drive via Swat Motorway. Ascend to Malam Jabba Ski Resort for chairlift views and mountain zip-lining.'
      },
      {
        day: 2,
        title: 'Mingora to Kalam Valley',
        desc: 'Follow the roaring Swat River through Bahrain bazaars. Arrive in Kalam surrounded by deodar pine mountains.'
      },
      {
        day: 3,
        title: 'Mahodand & Saifullah Glacial Lakes Safari',
        desc: 'Board 4x4 jeeps through Ushu Forest and Matiltan waterfall to reach turquoise Mahodand Lake. Boating and trout lunch.'
      },
      {
        day: 4,
        title: 'Kumrat Valley Pine Expedition',
        desc: 'Full-day excursion into virgin Kumrat Valley. Stroll through the towering pine sanctuary and relax beside the emerald river.'
      },
      {
        day: 5,
        title: 'White Palace & Return to Islamabad',
        desc: 'Visit historical White Palace in Marghazar before a smooth return journey via Swat Express Motorway.'
      }
    ]
  },
  {
    id: 'k2-base-camp-concordia-trek',
    title: '14-Day K2 Base Camp & Concordia Throne Room of Gods',
    tagline: 'The ultimate high-altitude pilgrimage to the foot of K2, Broad Peak, and the Gasherbrums.',
    destinationId: 'skardu-valley',
    region: 'Gilgit-Baltistan',
    durationDays: 14,
    durationNights: 13,
    pricePKR: 295000,
    priceUSD: 1060,
    rating: 5.0,
    reviewsCount: 42,
    difficulty: 'Challenging / Technical',
    groupSize: '6 - 12 Trekkers',
    departureLocation: 'Skardu',
    featured: true,
    operator: {
      name: 'High Altitude Karakoram Expeditions',
      badge: 'Certified Alpine Club of Pakistan',
      contact: '+92 311 9991122',
      rating: 5.0
    },
    highlights: [
      'Trek on Baltoro Glacier — one of the longest non-polar glaciers on earth',
      'Camp at Concordia (4,691m) with 360-degree views of four 8,000m giants',
      'Stand at K2 Base Camp (5,150m) and Art Gilkey Memorial',
      'Up-close views of Trango Towers and Cathedral Spires',
      'Experienced high-altitude Sherpa / Balti mountain crew'
    ],
    inclusions: [
      'All government trekking permits, royalty fees & national park passes',
      'Full camping logistics, dome tents, mess tent & warm dining gear',
      'Expert high-altitude mountain guide, cook & porter team (12.5kg per trekker)',
      'Three hot nutritious meals per day on glacier with boiled drinking water',
      'Oxygen cylinders, hyperbaric bag & emergency satellite rescue link',
      '4WD Jeep transfer Skardu to Askole / Jhola and back'
    ],
    exclusions: [
      'Helicopter evacuation insurance (mandatory)',
      'Personal high-altitude mountaineering boots & crampons',
      'Tips for guide and porter team'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Skardu to Askole / Jhola',
        desc: 'Rugged 4x4 drive along the Braldu River gorge to the trailhead at Askole.'
      },
      {
        day: 2,
        title: 'Jhola to Paiju Camp (3,400m)',
        desc: 'Trek along the river valley with the first dramatic glimpses of the Cathedral Towers.'
      },
      {
        day: 3,
        title: 'Rest & Acclimatization at Paiju',
        desc: 'Acclimatization day overlooking the snout of the immense Baltoro Glacier. Bread baking by porters.'
      },
      {
        day: 4,
        title: 'Paiju to Khoburtse across Snout',
        desc: 'Step onto the moraines of Baltoro Glacier with Trango Towers rising like granite needles.'
      },
      {
        day: 5,
        title: 'Khoburtse to Urdukas (4,050m)',
        desc: 'Spectacular cliffside campsite with panorama of Trango, Cathedral, and Masherbrum.'
      },
      {
        day: 6,
        title: 'Urdukas to Goro II (4,300m)',
        desc: 'Glacial trek along white ice corridor with Gasherbrum IV dominating the skyline.'
      },
      {
        day: 7,
        title: 'Goro II to Concordia (4,691m)',
        desc: 'Arrive at the legendary Throne Room of the Mountain Gods. K2, Broad Peak, and Gasherbrums in full view.'
      },
      {
        day: 8,
        title: 'Excursion to K2 Base Camp (5,150m) & Gilkey Memorial',
        desc: 'Early morning trek to the foot of K2. Visit climbers memorial and touch the slopes of the Savage Mountain.'
      },
      {
        day: 9,
        title: 'Concordia Exploration & Broad Peak Base Camp',
        desc: 'Explore the confluence of Baltoro and Godwin-Austen glaciers under the shadow of Broad Peak.'
      },
      {
        day: 10,
        title: 'Begin Return Trek: Concordia to Goro I',
        desc: 'Descent down the Baltoro glacier enjoying fresh perspectives of the Karakoram wall.'
      },
      {
        day: 11,
        title: 'Goro I to Urdukas',
        desc: 'Camp again on the grassy ledges of Urdukas overlooking the glacier.'
      },
      {
        day: 12,
        title: 'Urdukas to Paiju',
        desc: 'Descend off the glacier onto the river flats at Paiju.'
      },
      {
        day: 13,
        title: 'Paiju to Askole & Jeep to Skardu',
        desc: 'Final walking stretch to Askole trailhead. Reboard 4x4 jeeps for return celebration in Skardu.'
      },
      {
        day: 14,
        title: 'Skardu Celebration & Departure',
        desc: 'Rest day, certificate of accomplishment, and departure transfer.'
      }
    ]
  }
];

export function getPackageById(id) {
  return TOUR_PACKAGES.find((pkg) => pkg.id === id) || null;
}
