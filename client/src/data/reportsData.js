/**
 * ==============================================================================
 * RAASTAH (راستہ) — COMMUNITY ROAD & PASS CONDITION REPORTS
 * Real-time fallback reports for major Pakistani highways and alpine passes.
 * ==============================================================================
 */

export const FALLBACK_ROAD_REPORTS = [
  {
    id: 'rep-01',
    destinationSlug: 'hunza-valley',
    roadOrPass: 'Karakoram Highway (KKH) — Attabad to Passu',
    condition: 'Open - Clear Tarmac',
    severity: 'clear',
    description: 'Road is completely open and dry through all tunnels. Light evening crosswinds near Passu Cones. Standard 2WD vehicles moving smoothly.',
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'verified_active',
    location: { name: 'Attabad Tunnels & Passu', coordinates: [74.75, 36.42] }
  },
  {
    id: 'rep-02',
    destinationSlug: 'naran-kaghan',
    roadOrPass: 'Babusar Top Pass (4,173m)',
    condition: 'Caution - Freezing Night Fog',
    severity: 'caution',
    description: 'Daytime travel clear. Freezing fog develops after 6 PM with temperatures dropping to -2°C. Snow chains recommended for evening descents into Chilas.',
    reportedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    status: 'verified_active',
    location: { name: 'Babusar Top', coordinates: [73.68, 35.15] }
  },
  {
    id: 'rep-03',
    destinationSlug: 'skardu-valley',
    roadOrPass: 'Jaglot-Skardu Road (S-1 Strategic Highway)',
    condition: 'Open - Controlled Single-Lane Section',
    severity: 'caution',
    description: 'Widening work near Astak Nala. Expect 10-15 minute traffic pacing by FWO. Good asphalt throughout remaining 140km.',
    reportedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    status: 'verified_active',
    location: { name: 'Jaglot-Skardu Highway S-1', coordinates: [75.02, 35.61] }
  },
  {
    id: 'rep-04',
    destinationSlug: 'kalam-swat',
    roadOrPass: 'Bahrain to Kalam Valley Road',
    condition: 'Open - Normal Clearance',
    severity: 'clear',
    description: 'Recently resurfaced bypass operating normally. Light spray near roadside waterfalls; all sedan and passenger vehicles passing without obstruction.',
    reportedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    status: 'verified_active',
    location: { name: 'Kalam Swat Highway', coordinates: [72.58, 35.49] }
  },
  {
    id: 'rep-05',
    destinationSlug: 'islamabad',
    roadOrPass: 'M-15 Hazara Motorway & Abbottabad Expressway',
    condition: 'Open - Optimal High-Speed',
    severity: 'clear',
    description: 'Motorway Police (NHMP) active. All lanes open with zero fog or visibility limitations. High speed corridor operating 100% smooth.',
    reportedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    status: 'verified_active',
    location: { name: 'M-15 Hazara Motorway', coordinates: [73.12, 34.18] }
  }
];
