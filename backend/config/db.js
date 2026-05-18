const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in .env file');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Wait 30 seconds before timing out
      family: 4, // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed standard Philippine Holidays
    const { seedPHHolidays } = require('../utils/holidaySeeder');
    seedPHHolidays().catch(err => console.error("Error seeding holidays:", err));
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    // We don't exit(1) here to allow the app to potentially retry or show errors on requests
  }
};

module.exports = connectDB;
