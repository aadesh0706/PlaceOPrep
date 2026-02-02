const mongoose = require('mongoose');
const Question = require('./models/Question');

async function checkDatabases() {
  const databases = ['skillspectrum', 'placeoprep'];

  for (const dbName of databases) {
    try {
      console.log(`\nChecking database: ${dbName}`);
      await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);

      const count = await Question.countDocuments({});
      console.log(`Questions in ${dbName}: ${count}`);

      if (count > 0) {
        const sample = await Question.findOne({});
        console.log(`Sample question category: ${sample.category}`);
        console.log(`Sample question company: ${JSON.stringify(sample.company)}`);
      }

      await mongoose.disconnect();
    } catch (error) {
      console.log(`Error connecting to ${dbName}: ${error.message}`);
    }
  }

  process.exit(0);
}

checkDatabases();