const mongoose = require('mongoose');

const { Schema } = mongoose;

function collectionSchema(fields = {}) {
  return new Schema({
    id: { type: String, required: true, unique: true },
    ...fields
  }, {
    strict: false,
    versionKey: false,
    minimize: false
  });
}

const geoPoint = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: (coordinates) => coordinates.length === 2
        && coordinates[0] >= -180 && coordinates[0] <= 180
        && coordinates[1] >= -90 && coordinates[1] <= 90,
      message: 'GeoJSON coordinates must be [longitude, latitude].'
    }
  }
}, { _id: false });

const schemas = {
  User: collectionSchema({
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: { type: Schema.Types.Mixed, default: {} }
  }),
  Booking: collectionSchema(),
  SearchEvent: collectionSchema(),
  DestinationView: collectionSchema(),
  CustomerFeedback: collectionSchema(),
  RoadReport: collectionSchema({
    status: {
      type: String,
      enum: ['pending_verification', 'verified_active', 'rejected'],
      default: 'pending_verification',
      index: true
    },
    reportedAt: { type: Date, default: Date.now, index: true },
    location: { type: geoPoint, required: false }
  }),
  DriverApplication: collectionSchema({
    status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review', index: true },
    location: { type: geoPoint, required: false }
  }),
  PriceHistory: collectionSchema(),
  AuditLog: collectionSchema(),
  Driver: collectionSchema({
    applicationId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['approved', 'rejected', 'suspended'], required: true, index: true },
    location: { type: geoPoint, required: false }
  }),
  MarketplaceExperience: collectionSchema({
    status: { type: String, enum: ['pending_review', 'approved', 'rejected', 'suspended'], default: 'pending_review', index: true },
    location: { type: geoPoint, required: false },
    pricePKR: { type: Number, min: 0, required: false }
  }),
  TripOutline: collectionSchema({
    status: { type: String, enum: ['draft', 'pending_review', 'published', 'archived'], default: 'draft', index: true }
  }),
  PoliceStation: collectionSchema({
    osmType: { type: String, required: true },
    osmId: { type: Number, required: true },
    name: { type: String, required: true },
    amenity: { type: String, enum: ['police', 'hospital'], required: true },
    location: { type: geoPoint, required: true },
    source: { type: String, enum: ['OpenStreetMap'], default: 'OpenStreetMap' },
    fetchedAt: { type: Date, required: true }
  })
};

schemas.Driver.index({ location: '2dsphere' });
schemas.PoliceStation.index({ location: '2dsphere' });
schemas.PoliceStation.index({ osmType: 1, osmId: 1 }, { unique: true });
schemas.RoadReport.index({ location: '2dsphere' });
schemas.MarketplaceExperience.index({ location: '2dsphere' });

const modelNames = {
  User: 'User',
  drivers: 'Driver',
  marketplaceExperiences: 'MarketplaceExperience',
  bookings: 'Booking',
  searchEvents: 'SearchEvent',
  destinationViews: 'DestinationView',
  customerFeedback: 'CustomerFeedback',
  routeReports: 'RoadReport',
  driverApplications: 'DriverApplication',
  priceHistory: 'PriceHistory',
  auditLogs: 'AuditLog'
};

const models = Object.fromEntries(Object.entries(schemas).map(([name, schema]) => [
  name,
  mongoose.models[name] || mongoose.model(name, schema)
]));

const collections = Object.fromEntries(Object.entries(modelNames).map(([collectionName, modelName]) => [
  collectionName,
  models[modelName]
]));

module.exports = { models, collections };
