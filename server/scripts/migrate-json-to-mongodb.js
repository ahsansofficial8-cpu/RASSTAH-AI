const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

const dataPath = path.join(__dirname, '..', 'data', 'raastah_db.json');
const sourceToModel = {
  users: 'User',
  bookings: 'Booking',
  searchEvents: 'SearchEvent',
  destinationViews: 'DestinationView',
  customerFeedback: 'CustomerFeedback',
  routeReports: 'RoadReport',
  driverApplications: 'DriverApplication',
  priceHistory: 'PriceHistory',
  auditLogs: 'AuditLog'
};

async function migrate() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Set MONGODB_URI before running this migration.');
  if (!fs.existsSync(dataPath)) throw new Error(`Legacy JSON data file was not found: ${dataPath}`);

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const { models } = require('../models');
  await Promise.all(Object.values(models).map((model) => model.init()));

  for (const [sourceName, modelName] of Object.entries(sourceToModel)) {
    const records = data[sourceName];
    if (!Array.isArray(records)) {
      throw new Error(`Legacy collection "${sourceName}" is missing or is not an array.`);
    }
    if (records.length === 0) continue;
    const model = models[modelName];
    if (await model.countDocuments()) {
      throw new Error(`MongoDB collection "${model.collection.name}" is not empty; refusing to overwrite or duplicate records.`);
    }
    await model.insertMany(records, { ordered: true });
    console.log(`Migrated ${records.length} documents from ${sourceName}.`);
  }
}

migrate()
  .catch((error) => {
    console.error('MongoDB migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
