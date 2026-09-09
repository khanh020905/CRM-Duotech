import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('No MONGODB_URI found');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;

  // Drop or clean mock collections
  const collectionsToClean = ['customers', 'deals', 'contracts', 'tasks', 'calendarevents'];
  for (const name of collectionsToClean) {
    try {
      const res = await db.collection(name).deleteMany({});
      console.log(`Deleted ${res.deletedCount} documents from ${name}.`);
    } catch (e) {
      console.log(`Collection ${name} delete error:`, e.message);
    }
  }

  // Ensure default workspace in workspaces collection
  const wsColl = db.collection('workspaces');
  await wsColl.updateOne(
    { id: 'ws-default' },
    {
      $set: {
        id: 'ws-default',
        name: 'Duotech Solution',
        slug: 'duotech-solution',
        description: 'Trụ sở chính công ty Duotech Solution',
        contactEmail: 'contact@duotech.vn',
        phone: '028 3822 9999',
        address: 'Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh',
        taxCode: '0316888999',
        website: 'https://duotech.vn',
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VNĐ',
        dateFormat: 'dd/MM/yyyy',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
  console.log('Default workspace created/updated.');

  // Check counts
  for (const name of [...collectionsToClean, 'workspaces', 'members', 'settings']) {
    const count = await db.collection(name).countDocuments();
    console.log(`Current count in ${name}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('Done cleaning mock data.');
}

run().catch(console.error);
