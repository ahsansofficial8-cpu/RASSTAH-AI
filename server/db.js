const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { models, collections } = require('./models');

function plain(document) {
  if (!document) return null;
  const value = typeof document.toObject === 'function' ? document.toObject() : document;
  delete value._id;
  delete value.__v;
  return value;
}

class RaastahDatabase {
  async connect() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MongoDB is required. Configure MONGODB_URI in the deployment environment.');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    await Promise.all(Object.values(models).map((model) => model.init()));
    await this.bootstrapAdminFromEnvironment();
  }

  get connected() {
    return mongoose.connection.readyState === 1;
  }

  assertConnected() {
    if (!this.connected) {
      const error = new Error('MongoDB is not connected.');
      error.code = 'MONGODB_UNAVAILABLE';
      throw error;
    }
  }

  async bootstrapAdminFromEnvironment() {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!email && !password) return;
    if (!email || !password || password.length < 14) {
      throw new Error('Set both BOOTSTRAP_ADMIN_EMAIL and a BOOTSTRAP_ADMIN_PASSWORD of at least 14 characters.');
    }

    const existing = await this.findUserByEmail(email);
    if (existing) {
      if (existing.role !== 'admin') {
        throw new Error('BOOTSTRAP_ADMIN_EMAIL already belongs to a non-admin account.');
      }
      return;
    }

    await this.createUser({
      name: process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'Administrator',
      email,
      password,
      role: 'admin'
    });
  }

  async list(collection, filter = {}, sort = {}, limit = 0) {
    this.assertConnected();
    const model = collections[collection];
    if (!model) throw new Error(`Unknown database collection: ${collection}`);
    let query = model.find(filter).sort(sort);
    if (limit > 0) query = query.limit(limit);
    const documents = await query.exec();
    return documents.map(plain);
  }

  async count(collection, filter = {}) {
    this.assertConnected();
    const model = collections[collection];
    if (!model) throw new Error(`Unknown database collection: ${collection}`);
    return model.countDocuments(filter).exec();
  }

  async findUserByEmail(email) {
    this.assertConnected();
    return plain(await models.User.findOne({ email: email.toLowerCase() }).exec());
  }

  async findUserById(id) {
    this.assertConnected();
    return plain(await models.User.findOne({ id }).exec());
  }

  async createUser({ name, email, password, role = 'user', phone = '', city = 'Islamabad' }) {
    this.assertConnected();
    const normalizedEmail = email.trim().toLowerCase();
    if (await models.User.exists({ email: normalizedEmail })) {
      throw new Error('User with this email already exists.');
    }
    return plain(await models.User.create({
      id: `usr-${new mongoose.Types.ObjectId().toString()}`,
      name,
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      phone,
      city,
      registeredAt: new Date().toISOString(),
      preferences: {}
    }));
  }

  async updateUserProfile(userId, updates) {
    this.assertConnected();
    const changes = {};
    for (const field of ['name', 'phone', 'city']) {
      if (updates[field]) changes[field] = updates[field];
    }
    if (updates.preferences) {
      const user = await models.User.findOne({ id: userId }).exec();
      if (!user) return null;
      changes.preferences = { ...user.preferences, ...updates.preferences };
    }
    if (updates.password) changes.passwordHash = bcrypt.hashSync(updates.password, 10);
    return plain(await models.User.findOneAndUpdate(
      { id: userId },
      { $set: changes },
      { new: true, runValidators: true }
    ).exec());
  }

  async getAllUsersSanitized() {
    this.assertConnected();
    const users = await models.User.find({}, { passwordHash: 0 }).exec();
    return users.map(plain);
  }

  async getAllBookings() {
    return this.list('bookings', {}, { bookedAt: -1 });
  }

  async getBookingsForUser(userId, email) {
    this.assertConnected();
    const filter = email
      ? { $or: [{ userId }, { customerEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] }
      : { userId };
    return (await models.Booking.find(filter).sort({ bookedAt: -1 }).exec()).map(plain);
  }

  async getBookingById(id) {
    this.assertConnected();
    return plain(await models.Booking.findOne({ id }).exec());
  }

  async createBooking(payload) {
    this.assertConnected();
    return plain(await models.Booking.create({
      id: payload.id || `RAASTAH-${new mongoose.Types.ObjectId().toString()}`,
      ...payload,
      status: payload.status || 'pending',
      bookedAt: new Date().toISOString()
    }));
  }

  async updateBookingStatus(bookingId, status, adminNotes = '', assignedGuide = null) {
    this.assertConnected();
    const changes = { status };
    if (adminNotes) changes.adminNotes = adminNotes;
    if (assignedGuide) changes.assignedGuide = assignedGuide;
    return plain(await models.Booking.findOneAndUpdate(
      { id: bookingId },
      { $set: changes },
      { new: true }
    ).exec());
  }

  async logSearchEvent(event) {
    return this.addEvent('SearchEvent', { id: `srch-${new mongoose.Types.ObjectId()}`, ...event, createdAt: new Date().toISOString() }, 500);
  }

  async logDestinationView(event) {
    return this.addEvent('DestinationView', { id: `dv-${new mongoose.Types.ObjectId()}`, ...event, viewedAt: new Date().toISOString() }, 500);
  }

  async addEvent(modelName, item, maxItems) {
    this.assertConnected();
    const model = models[modelName];
    await model.create(item);
    const stale = await model.find().sort({ _id: -1 }).skip(maxItems).select('_id').exec();
    if (stale.length) await model.deleteMany({ _id: { $in: stale.map((record) => record._id) } }).exec();
    return item;
  }

  async addFeedback(item) {
    this.assertConnected();
    return plain(await models.CustomerFeedback.create({
      id: `fb-${new mongoose.Types.ObjectId()}`,
      ...item,
      status: 'published',
      createdAt: new Date().toISOString()
    }));
  }

  async addReport(item) {
    this.assertConnected();
    return plain(await models.RoadReport.create({
      id: `rep-${new mongoose.Types.ObjectId()}`,
      ...item,
      status: 'pending_verification',
      reportedAt: new Date().toISOString()
    }));
  }

  async addDriverApplication(item) {
    this.assertConnected();
    return plain(await models.DriverApplication.create({
      id: `driver-${new mongoose.Types.ObjectId()}`,
      ...item,
      status: 'pending_review',
      submittedAt: new Date().toISOString()
    }));
  }

  async updateDriverApplicationStatus(applicationId, status) {
    this.assertConnected();
    const application = await models.DriverApplication.findOneAndUpdate(
      { id: applicationId },
      { $set: { status, reviewedAt: new Date().toISOString() } },
      { new: true }
    ).exec();
    if (!application) return null;
    if (status === 'approved') {
      await models.Driver.findOneAndUpdate(
        { applicationId },
        {
          $set: {
            id: `guide-${applicationId}`,
            applicationId,
            name: application.name,
            ...(application.city ? { city: application.city } : {}),
            regions: application.regions,
            vehicle: application.vehicle,
            ...(application.publicContactConsent === true && application.publicContact
              ? { publicContact: application.publicContact }
              : {}),
            experienceYears: application.experienceYears,
            status: 'approved',
            reviewedAt: application.reviewedAt,
            ...(application.location ? { location: application.location } : {})
          }
        },
        { upsert: true, new: true, runValidators: true }
      ).exec();
    } else {
      await models.Driver.updateOne({ applicationId }, { $set: { status: 'rejected' } }).exec();
    }
    return plain(application);
  }

  async updateReportStatus(reportId, status) {
    this.assertConnected();
    return plain(await models.RoadReport.findOneAndUpdate(
      { id: reportId },
      { $set: { status } },
      { new: true }
    ).exec());
  }

  async getAllPriceHistory() {
    return this.list('priceHistory', {}, { createdAt: -1 });
  }

  async updatePriceStatus(id, status) {
    this.assertConnected();
    return plain(await models.PriceHistory.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    ).exec());
  }

  async logAudit(adminName, action, targetId, details) {
    this.assertConnected();
    const item = {
      id: `aud-${new mongoose.Types.ObjectId()}`,
      adminName,
      action,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    await models.AuditLog.create(item);
    const stale = await models.AuditLog.find().sort({ _id: -1 }).skip(300).select('_id').exec();
    if (stale.length) await models.AuditLog.deleteMany({ _id: { $in: stale.map((record) => record._id) } }).exec();
    return item;
  }

  async findNearbyPoliceStations(coordinates, fetchedAt, limit = 8) {
    this.assertConnected();
    return (await models.PoliceStation.find({
      fetchedAt,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 50000
        }
      }
    }).limit(limit).exec()).map(plain);
  }

  async findNearbyDrivers(coordinates, limit = 20) {
    this.assertConnected();
    return (await models.Driver.find({
      status: 'approved',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 50000
        }
      }
    }).limit(limit).exec()).map(plain);
  }

  async cachePoliceStations(stations) {
    this.assertConnected();
    if (!stations.length) return;
    await models.PoliceStation.bulkWrite(stations.map((station) => ({
      updateOne: {
        filter: { osmType: station.osmType, osmId: station.osmId },
        update: { $set: station },
        upsert: true
      }
    })));
  }
}

module.exports = new RaastahDatabase();
