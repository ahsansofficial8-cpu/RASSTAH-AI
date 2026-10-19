import { jsPDF } from 'jspdf';

function addParagraph(doc, text, y, options = {}) {
  const { fontSize = 10, color = [45, 55, 65], indent = 20, maxWidth = 170 } = options;
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(String(text || 'Not available'), maxWidth);
  const lineHeight = fontSize * 0.48;
  for (const line of lines) {
    if (y + lineHeight > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, indent, y);
    y += lineHeight;
  }
  return y + 3;
}

function addHeading(doc, title, y) {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setTextColor(13, 116, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 20, y);
  doc.setFont('helvetica', 'normal');
  return y + 8;
}

function addStatusMetric(doc, title, item, y) {
  const formatValue = (value) => {
    if (Array.isArray(value)) return value.map(formatValue).join('; ');
    if (value && typeof value === 'object') {
      return Object.entries(value).map(([key, entry]) => `${key}: ${formatValue(entry)}`).join(' · ');
    }
    return value == null ? 'Not available' : String(value);
  };
  const value = item?.value;
  const rendered = value == null ? 'No live snapshot available' : formatValue(value);
  y = addParagraph(doc, `${title}: ${rendered || 'No live snapshot available'}`, y, { fontSize: 9 });
  if (item?.source) y = addParagraph(doc, `Source: ${item.source}; status: ${item.status || 'unknown'}; captured: ${item.updatedAt || 'unknown'}`, y, { fontSize: 8, color: [100, 110, 120] });
  return y;
}

export function generateOfflinePack(destination, liveSnapshot) {
  if (!destination?.name || !destination?.slug) {
    throw new Error('A valid destination is required to create an offline dossier');
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const data = liveSnapshot?.data || {};
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(24, 48, 55);
  const titleLines = doc.splitTextToSize(destination.name, 170);
  doc.text(titleLines, 20, y);
  doc.setFont('helvetica', 'normal');
  y += (titleLines.length * 11) + 2;
  y = addParagraph(doc, `${destination.region} · ${destination.elevation} · ${destination.bestMonths}`, y);
  y = addParagraph(doc, `GPS: ${destination.lat}, ${destination.lng} (${destination.coordinateAccuracy || 'catalog coordinates; verify before navigation'})`, y, { fontSize: 9 });
  y = addParagraph(doc, `Created: ${new Date().toLocaleString()}. Live data below is the latest snapshot available in this browser session.`, y, { fontSize: 8, color: [100, 110, 120] });

  y = addHeading(doc, 'Live data snapshot', y + 3);
  y = addStatusMetric(doc, 'Weather and forecast', data.weather, y);
  y = addStatusMetric(doc, 'Driving route from Islamabad', data.route, y);
  y = addStatusMetric(doc, 'Currency rates', data.currency, y);
  y = addStatusMetric(doc, 'Nearest mapped hospital or clinic', data.hospital, y);
  y = addStatusMetric(doc, 'Nearest mapped fuel station', data.fuelStation, y);
  y = addStatusMetric(doc, 'Prayer times', data.prayer, y);
  y = addParagraph(doc, 'Live fuel prices, road conditions, mobile coverage, and lodging/food prices are not included because no dependable live provider is configured.', y, { fontSize: 8, color: [115, 75, 35] });

  y = addHeading(doc, 'Destination information', y + 3);
  y = addParagraph(doc, `Why it is known: ${destination.whyFamous}`, y);
  y = addParagraph(doc, `Local character: ${destination.whatsUnique}`, y);
  y = addParagraph(doc, `Vehicle/terrain guidance: ${destination.difficulty}. Confirm road and permit conditions locally before travelling.`, y);
  if (destination.activities?.length) {
    y = addParagraph(doc, `Things to do: ${destination.activities.join('; ')}`, y);
  }

  y = addHeading(doc, 'Travel checklist', y + 3);
  const packing = destination.packingAssistant || {};
  for (const [section, items] of Object.entries({
    'Seasonal essentials': packing.summerEssentials,
    'Cold-weather essentials': packing.winterEssentials,
    'Medical checklist': packing.medicalPack
  })) {
    if (items?.length) y = addParagraph(doc, `${section}: ${items.join('; ')}`, y, { fontSize: 9 });
  }

  y = addHeading(doc, 'Emergency information', y + 3);
  y = addParagraph(doc, `Emergency numbers: Rescue 1122 · Police 15. Verify local emergency services and nearest medical facilities before departure.`, y);
  y = addParagraph(doc, `Nearest facility in destination catalogue (not live verified): ${destination.hospitalNearby || 'Not listed'}`, y, { fontSize: 9 });

  doc.save(`Raastah_Offline_Pack_${destination.slug}.pdf`);
}
