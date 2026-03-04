const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'MATCHA Center' },
    contactEmail: { type: String, default: 'admin@matcha-center.com' },
    maintenanceMode: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 10 },
    allowRegistrations: { type: Boolean, default: true },
    multiVendor: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: 'EUR' },
    siteDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
