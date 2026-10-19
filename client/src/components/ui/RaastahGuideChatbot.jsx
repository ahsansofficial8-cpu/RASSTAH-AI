import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, X, Sparkles } from 'lucide-react';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';

function offlineReply(query) {
  const q = query.toLowerCase().trim();

  // 0. ITINERARY & TRIP PLANNING
  if (/\b(plan|itinerary|day trip|days trip|expedition plan|schedule)\b/.test(q)) {
    const dest = q.includes('skardu') ? 'Skardu & Deosai' : (q.includes('swat') ? 'Kalam Swat' : (q.includes('fairy') ? 'Fairy Meadows' : 'Hunza Valley'));
    return `🏔️ **Custom Expedition Plan for ${dest}:**

• **Day 1:** Departure via Hazara Motorway (M-15) → Scenic Babusar Pass ascent (4,173m) → Night stay at mountain riverside lodge.
• **Day 2:** Arrival in ${dest} → Check-in at alpine hotel → Sunset panoramic photography from high viewpoint.
• **Day 3:** 4x4 Excursion to glacial lake and suspension bridges → Traditional local cuisine and apricot tea.
• **Day 4:** High-altitude border or alpine meadow exploration → Wildlife spotting & local artisan bazaar.
• **Day 5:** Return descent along the Karakoram Highway → Debrief and arrival back at gateway city.

💵 **Estimated Budget:** PKR 65,000 – 85,000 for transport, 4x4, fuel & heritage stays.
<!--ACTION:{"action":"GENERATE_ITINERARY","destination":"${dest}","days":5,"label":"🗺️ Open ${dest} Plan in Route Planner"}-->`;
  }

  // 1. COMPLETE WEBSITE USER MANUAL
  if (/\b(website|manual|how to use|features|what can i do|pages|guide me on raastah|portal|how to book|help with app)\b/.test(q)) {
    return `🏔️ **Welcome to the Raastah (راستہ) Platform Guide!**
Here is your complete user manual for navigating the platform:

• **Destinations (/destinations):** Atlas of 99 curated Pakistani destinations across Gilgit-Baltistan, KPK, AJK, Balochistan, Sindh, and Punjab with elevation, weather, best season, and packing advice.
• **Tour Packages (/packages):** Verified multi-day guided tour packages with real-time seat availability and instant booking checkout.
• **Route Planner (/planner):** Interactive custom day-by-day route planner with altitude profiles and real OSRM road distance calculations.
• **AI Vibe Matcher (/mood-matcher):** 9-question deep analytical personality quiz matching you to your ideal mountain or cultural expedition.
• **Travel Tools (/tools):** Four live field utilities: Real-time Weather Radar, National Highway Road Alerts, Fuel & Cost Estimator, and Offline SOS Emergency Beacon.
• **Pocket Guide (/pocket-guide):** Multilingual voice converter and audio phrasebook supporting Urdu, English, German, Pashto, and Arabic.
• **4x4 Drivers Directory (/guides):** Directory of verified local 4x4 drivers and mountain guides with licenses, vehicle specs, and direct phone/WhatsApp dialers.
• **Operators Map (/operators):** Full-screen interactive map showing nearby tour operators, 4x4 drivers, routes, and destination hubs.
• **My Trips (/my-trips):** Customer dashboard to view, manage, download tickets, or review booked expeditions.
• **Admin Command Center (/admin):** Portal for verified operators and admins to oversee bookings, verify driver applications, and review platform metrics (Login: admin / ahsan2008).

Where would you like to explore first?
<!--ACTION:{"action":"NAVIGATE","path":"/destinations","label":"🏔️ Explore 99 Destinations Atlas"}-->`;
  }

  // 2. 50/50 DIVERSION RULE: Programming / Tech / Coding
  if (/\b(javascript|python|react|code|coding|function|loop|api|css|html|bug|developer|programming|closure|sql|git|node|typescript)\b/.test(q)) {
    let techAnswer = "In software engineering, writing modular, fault-tolerant code with clean abstractions and predictable state management is the key to scalability. Always minimize side effects, handle asynchronous edge cases, and structure components for maintainability.";
    if (q.includes("closure")) {
      techAnswer = "In JavaScript, a closure is the combination of a function bundled together with references to its surrounding lexical environment. Closures give an inner function access to an outer function's scope even after the outer function has finished executing.";
    } else if (q.includes("react")) {
      techAnswer = "React is a component-driven declarative library where UI is a pure function of state and props. With modern React hooks like useState, useEffect, and useMemo, data flows down unidirectionally and re-renders are triggered by immutable state changes.";
    } else if (q.includes("python")) {
      techAnswer = "Python emphasizes readability, elegant dynamic typing, and rapid prototyping with powerful standard libraries like itertools, dataclasses, and rich async/await support.";
    }

    return `${techAnswer}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ **Now, speaking of engineering precision & great journeys:**
Traversing the Karakoram Highway (KKH) — the Eighth Wonder of the World — or navigating the hairpin curves of Babusar Top at 4,173m requires that exact same meticulous fault tolerance and preparation! 

When you're ready to step away from the IDE and breathe pure Himalayan glacier air, check out Raastah's **Route Planner (/planner)** to map elevation profiles, or let our **AI Vibe Matcher (/mood-matcher)** pick your next northern escape!`;
  }

  // 3. 50/50 DIVERSION RULE: Math / Physics / Science
  if (/\b(math|physics|calculate|gravity|speed|equation|science|chemistry|acceleration|formula|derivative|integral)\b/.test(q)) {
    return `In scientific modeling and mathematics, equations govern kinetic motion, thermodynamics, and physical equilibria — from gravitational potential energy (E = mgh) to fluid dynamics and friction coefficients.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ **How this translates to Pakistan's high-altitude expeditions:**
Did you know that descending the switchbacks of Babusar Pass (4,173m) or crossing the 4,114m Deosai plateau puts these exact physics to the test? Engine braking, air density shifts affecting 4x4 carburetor oxygen-fuel mixtures, and braking thermal loads are real factors mountain drivers face daily!

You can calculate your trip's exact fuel, toll gates, and 4x4 rental economics using our **Travel Tools (/tools)**, or explore verified 4x4 drivers at **/guides**!`;
  }

  // 4. 50/50 DIVERSION RULE: Philosophy / Life / Well-being
  if (/\b(meaning of life|philosophy|happy|sad|depressed|stress|anxiety|peace|bored|life advice|purpose)\b/.test(q)) {
    return `True balance and clarity often emerge when we step back from the hyperactive rush of everyday demands and reconnect with silence, perspective, and natural grandeur.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ **A perspective from the high Himalayas:**
Few things restore the human spirit like standing before the towering 7,788m wall of Rakaposhi in Nagar, or listening to the glacial breeze under the starry night sky of Hunza Valley. 

If your soul is looking for rejuvenation, let our **AI Vibe Matcher (/mood-matcher)** guide you to tranquil valleys like Phander Lake or Fairy Meadows, where time truly slows down.`;
  }

  // 5. 50/50 DIVERSION RULE: Jokes / Humor / Riddles
  if (/\b(joke|funny|riddle|make me laugh|humor|tell me a joke)\b/.test(q)) {
    return `Here is a fun one for you:
*Why don't mountain passes ever get lost?*
Because they always follow the peak directions! 😄

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏔️ **On a serious note about mountain paths:**
The local 4x4 drivers along the Indus Gorge and Fairy Meadows have lived on these ridges for generations and tell the best campfire stories in the world. You can browse our directory of verified high-altitude drivers right now at **/guides** or explore the interactive map at **/operators**!`;
  }

  // 6. GREETINGS & SMALL TALK
  if (/\b(hi|hello|hey|salam|slam|assalam|a-o-a|who are you|how are you|kese ho|kaise ho)\b/.test(q)) {
    return `اسلام علیکم! (Khushamdeed!) I am **Raastah AI (راستہ رہبر)**, your dedicated high-altitude expedition lead and master of the entire Raastah platform.

I can guide you with 200% deep-dive advice on:
• **Alpine Destinations:** Hunza, Skardu, Fairy Meadows, Swat, Naran, Kumrat, Neelum, Gwadar, Chitral, and 90+ more.
• **Roads & Mountain Passes:** Babusar Pass status, Lowari Tunnel, Shandur, KKH Kohistan route, and 4x4 terrain advisories.
• **Budgeting & 4x4s:** Prado vs Hilux rates, verified driver directory, fuel costs, and tour packages.
• **Platform Navigation:** Finding tools, building custom routes, or booking tours.

What destination or mountain road is calling you?`;
  }

  // 7. 200% TOUR GUIDE: Babusar Pass & Mountain Passes
  if (/\b(babusar|pass|passes|lowari|khunjerab|shandur|road status|open or closed|landslide)\b/.test(q)) {
    return `🏔️ **200% Deep-Dive: Pakistan High-Altitude Passes & Road Status**

• **Babusar Pass (4,173m / 13,691 ft):**
  - **Status Window:** Seasonally open from **mid-June to late-October**. Heavy snowfall closes the pass from November through May.
  - **Alternative Route:** When Babusar is closed, travel via the all-weather **Karakoram Highway (N-35)** through Hazara Motorway, Besham, Dassu, and Chilas.
  - **Drive Advisory:** Steep gradients require low gear engine braking. Check brake pads before ascending.

• **Khunjerab Pass (4,693m / 15,397 ft):**
  - The highest paved international border crossing in the world (Pakistan-China).
  - Open for travelers from **April 1 to November 30**. Pack warm thermal layers year-round; oxygen levels drop significantly above Sost.

• **Lowari Tunnel (M-45):**
  - Operational **24/7 all year round**, providing uninterrupted, safe access into Lower Dir and Chitral Valley.

• **Shandur Pass (3,719m):**
  - Connects Gilgit to Chitral. Open **June to October**. Home of the historic Shandur Polo Festival every July. High clearance 4x4 recommended.

🚨 **Live Field Tip:** Check our live road advisories and traveler alerts anytime at **Travel Tools (/tools)**!`;
  }

  // 8. 200% TOUR GUIDE: 4x4 Jeeps, Drivers & Transport
  if (/\b(jeep|4x4|driver|drivers|car|prado|hilux|transport|rent a car|hire|chauffeur)\b/.test(q)) {
    return `🚙 **200% Deep-Dive: Mountain 4x4s & Verified Local Drivers**

When traveling into northern Pakistan, vehicle selection depends strictly on the terrain:
• **Sedans / Hatchbacks:** Suitable for Hazara Motorway, KKH up to Gilgit/Hunza, Naran bazaar, and Swat motorway.
• **4x4 Prado / Hilux Revo / Fortuner:** Required for Deosai Plains, Shigar Valley, Naltar Valley, Kumrat forest, and Neelum Valley upper reaches.
• **Mountain Jeep Unions:** Fairy Meadows track from Raikot Bridge strictly requires local 4x4 jeeps driven by authorized native drivers.

**Typical Driver Rates (2026 Season):**
• Local day-trip 4x4: PKR 14,000 – PKR 18,000/day
• Inter-city Prado TZ / Hilux Revo: PKR 20,000 – PKR 26,000/day (inclusive of driver daily allowance)

👉 **Find Verified Drivers:** Browse our vetted directory with license badges, phone dialers, and WhatsApp chats at **/guides** or view them on our live interactive map at **/operators**!`;
  }

  // 9. 200% TOUR GUIDE: Tour Packages & Pricing
  if (/\b(package|packages|price|prices|cost|budget|how much|rate|rates|trip cost|tour cost)\b/.test(q)) {
    return `💵 **200% Deep-Dive: Curated Expedition Packages & Costs**

Raastah offers certified, all-inclusive tour packages with verified transport, executive hotel stays, and professional expedition leads:

• **3-Day Neelum Valley Escape:**
  - Starting from **PKR 34,999 / person**
  - Includes: Muzaffarabad, Keran, Sharda ruins, luxury coaster transport, and riverside stays.
• **5-Day Hunza Autumn & Attabad Lake:**
  - Starting from **PKR 54,999 / person**
  - Includes: Altit/Baltit Forts, Passu Cones, Attabad boating, and sunset at Eagle's Nest.
• **7-Day Ultimate Skardu & Deosai Plains:**
  - Starting from **PKR 78,500 / person**
  - Includes: Shangrila Resort, Upper Kachura Lake, Katpana Cold Desert safari, and Deosai Plateau.
• **10-Day K2 Base Camp Trekker Expedition:**
  - Starting from **PKR 185,000 / person** (Full expedition logistical support).

👉 View complete package itineraries and book live seats at **/packages**, or build a custom estimate at **/tools**!`;
  }

  // 10. 200% TOUR GUIDE: Specific Valley & Destination Lookups
  const destination = PAKISTAN_99_LOCATIONS.find((location) => (
    q.includes(location.name.toLowerCase())
    || q.includes(location.id.replaceAll('-', ' '))
    || q.includes(location.id)
  ));

  if (destination || /\b(hunza|skardu|fairy meadows|swat|naran|kalam|kumrat|neelum|gwadar|deosai|chitral|shangrila|katpana|attabad|passu)\b/.test(q)) {
    const name = destination ? destination.name : (q.includes('skardu') ? 'Skardu Valley' : 'Hunza Valley');
    const elev = destination?.elevationMeters ? `${destination.elevationMeters}m (${Math.round(destination.elevationMeters * 3.28084)} ft)` : '2,400m - 3,500m';
    const season = destination?.bestSeason || 'May through October';
    const slug = destination?.id || (q.includes('skardu') ? 'shangrila-resort' : 'attabad-lake');

    return `🏔️ **200% Comprehensive Guide: ${name}**

• **Elevation & Geography:** Situated at an altitude of approximately **${elev}**, surrounded by jagged peaks of the Karakoram and Himalayan ranges.
• **Best Time to Visit:** **${season}**. Summer offers pleasant daytime temperatures (18°C–25°C), while October transforms the valley into a golden autumn wonderland.
• **Road Accessibility:** 
  - Accessible via the Karakoram Highway (KKH N-35) or Babusar Pass (N-15) in summer.
  - Paved tarmac roads reach main towns; side excursions (e.g. higher viewpoints, glacial moraines) require high-clearance 4x4s.
• **Must-Try Local Cuisine:** Chapshuro (Tibetan-style meat pie), Mamtu (steamed dumplings), Hunza walnut cake, and fresh Himalayan river trout.
• **Safety & Acclimatization:** Stay hydrated, pack windproof thermal layers, and take the first 24 hours at an easy pace.

👉 **Next Steps:**
- Explore full photos, weather, and packing checklist on the **[${name} Destination Page](/destinations/${slug})**.
- Book curated group departures at **/packages**.
- Find a verified local driver at **/guides**!`;
  }

  // DEFAULT TOUR GUIDE RESPONSE
  return `🏔️ **Salam from Raastah AI!**
I am your personal 200% Pakistan expedition guide. You can ask me about:

1. **Destinations:** Hunza, Skardu, Fairy Meadows, Swat, Naran, Kumrat, Neelum, Gwadar, Chitral, and 90+ more.
2. **Road Conditions & Passes:** Babusar Pass, Lowari Tunnel, Khunjerab, and KKH routes.
3. **4x4 Jeeps & Drivers:** Vehicle specs, verified driver directory, and rates.
4. **Platform Navigation:** Exploring the 99-destinations atlas (/destinations), taking the AI Vibe Matcher (/mood-matcher), or using the Route Planner (/planner).

Tell me what kind of adventure you are planning!`;
}

export default function RaastahGuideChatbot() {
  const pageLocation = useLocation();
  const currentSlug = pageLocation.pathname.split('/').filter(Boolean)[1];
  const currentDestination = pageLocation.pathname.startsWith('/destinations/')
    ? PAKISTAN_99_LOCATIONS.find((location) => location.id === currentSlug)
    : null;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "اسلام علیکم! Welcome to Raastah (راستہ), your premier high-altitude expedition guide for Pakistan. Ask me about any destination, mountain pass status, 4x4 driver, or how to use our platform tools!",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wakeUpNotice, setWakeUpNotice] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, wakeUpNotice]);

  const handleSend = async (e, textToSend) => {
    e?.preventDefault();
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setWakeUpNotice(false);

    const wakeUpTimer = setTimeout(() => {
      setWakeUpNotice(true);
    }, 4000);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/tools/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages
            .filter((item) => !item.text.startsWith('The AI assistant is unavailable:'))
            .slice(-3)
            .map((item) => ({
              role: item.sender === 'bot' ? 'assistant' : 'user',
              content: item.text
            })),
          context: currentDestination ? {
            destination: {
              id: currentDestination.id,
              name: currentDestination.name,
              lat: currentDestination.lat,
              lng: currentDestination.lng
            }
          } : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Travel assistant returned HTTP ${res.status}`);

      // Extract action command if present
      const rawText = data.reply || '';
      let actionObj = null;
      const actionMatch = rawText.match(/<!--ACTION:([\s\S]*?)-->/);
      if (actionMatch) {
        try {
          actionObj = JSON.parse(actionMatch[1].trim());
        } catch (e) {
          console.warn('Action command parse error', e);
        }
      }
      const cleanReply = rawText.replace(/<!--ACTION:[\s\S]*?-->/g, '').trim();

      // Ensure at least 1-second simulated typing delay so it feels natural and human
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: cleanReply,
        action: actionObj,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (requestError) {
      console.warn('Raastah travel assistant request failed; showing the offline guide response.', requestError);
      const fallbackRaw = offlineReply(query);
      let actionObj = null;
      const actionMatch = fallbackRaw.match(/<!--ACTION:([\s\S]*?)-->/);
      if (actionMatch) {
        try {
          actionObj = JSON.parse(actionMatch[1].trim());
        } catch (e) {
          console.warn('Offline action parse error', e);
        }
      }
      const cleanReply = fallbackRaw.replace(/<!--ACTION:[\s\S]*?-->/g, '').trim();

      // Simulated human typing pace
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: cleanReply,
        action: actionObj,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      clearTimeout(wakeUpTimer);
      setWakeUpNotice(false);
      setIsTyping(false);
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-4 sm:right-6 select-none pointer-events-auto"
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}
    >
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl border-2 border-white/20 hover:brightness-110 transition-all cursor-pointer"
        >
          <div className="relative rounded-full bg-white p-1">
            <Sparkles size={22} className="text-[var(--brand-primary)]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold font-display leading-tight flex items-center gap-1.5 text-white">
              Raastah AI Guide <span className="font-urdu text-[11px] text-accent">راستہ رہبر</span>
            </span>
            <span className="text-[10px] text-white/80 leading-tight">Pakistan expedition guide & copilot</span>
          </div>
        </motion.button>
      )}

      {/* Interactive Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="raastah-chat-title"
            className="flex h-[min(620px,calc(100dvh-1rem))] w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl sm:h-[min(620px,calc(100dvh-3rem))] sm:w-[460px]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-[var(--text-primary)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-primary-soft)]">
                  <Sparkles size={22} className="text-[var(--brand-primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="raastah-chat-title" className="font-display text-base font-bold text-[var(--text-primary)]">Raastah AI Tour Guide</h3>
                  </div>
                  <span className="font-urdu text-[11px] text-[var(--brand-primary)] font-medium">
                    راستہ رہبر — Pakistan Mountain Expeditions & User Manual
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Raastah AI Copilot"
                className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleSend(null, "Plan a 5-day expedition to Hunza Valley with cost and stops")}
                className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                🗺️ Plan a Trip
              </button>
              <button
                type="button"
                onClick={() => handleSend(null, 'What is the live weather forecast and road status for Skardu?')}
                className="shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                🌦️ Check Weather
              </button>
              <button
                type="button"
                onClick={() => handleSend(null, 'Find me a verified 4x4 mountain driver with rates')}
                className="shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                🚙 Find a Driver
              </button>
              <button
                type="button"
                onClick={() => handleSend(null, 'Show me available tour packages and current PKR prices')}
                className="shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                📦 Tour Packages
              </button>
              <button
                type="button"
                onClick={() => handleSend(null, 'Help me decide where to travel in Pakistan, match my vibe')}
                className="shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                🧭 Where Should I Go?
              </button>
              <button
                type="button"
                onClick={() => handleSend(null, 'How do I use this website and what features does Raastah have?')}
                className="shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                💡 Website Guide
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 space-y-3.5 overflow-y-auto bg-[var(--bg-page)] p-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                      <Sparkles size={18} />
                    </div>
                  )}
                  <div className={`max-w-[85%] break-words rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                    ? 'rounded-tr-none bg-[var(--brand-primary)] text-white shadow-md'
                    : 'rounded-tl-none border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-card'
                  }`}>
                    <p className={`whitespace-pre-line ${msg.sender === 'user' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{msg.text}</p>
                    
                    {/* Interactive Action Button from AI */}
                    {msg.action && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--border-default)]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (msg.action.action === 'GENERATE_ITINERARY') {
                              navigate(`/planner?dest=${encodeURIComponent(msg.action.destination || 'Hunza')}&days=${msg.action.days || 5}`);
                            } else if (msg.action.path) {
                              navigate(msg.action.path);
                            } else {
                              navigate('/planner');
                            }
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
                        >
                          <span>{msg.action.label || '🗺️ Open in Platform Tool →'}</span>
                        </button>
                      </div>
                    )}

                    <div className={`text-[10px] mt-2 flex items-center justify-between ${
                      msg.sender === 'user' ? 'text-white/75' : 'text-[var(--text-muted)]'
                    }`}>
                      <span>{msg.time}</span>
                      {msg.sender === 'bot' && (
                        <span className="font-semibold text-[10px] text-emerald-600 dark:text-emerald-400">
                          Raastah AI Guide
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {wakeUpNotice && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                  <Sparkles size={16} className="animate-spin text-amber-500 shrink-0" />
                  <span>The high-altitude servers are waking up from sleep. Please give me 15 seconds...</span>
                </div>
              )}

              {isTyping && (
                <div className="flex items-center gap-2 p-2 text-xs text-[var(--text-secondary)]">
                  <Sparkles size={16} className="animate-pulse text-[var(--brand-primary)]" />
                  <span>Raastah AI is formulating high-altitude advice...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
              <input
                type="text"
                placeholder="Ask Raastah AI (e.g. Babusar status, Skardu 4x4, app manual, coding)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--brand-primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-md transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
