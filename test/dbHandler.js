const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports.connect = async () => {
    mongoServer = await MongoMemoryServer.create();

    const mongooseOpts = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    };
    await mongoose.connect(mongoServer.getUri(), mongooseOpts);
}

 module.exports.closeDatabase = async () => {
    await mongoose.disconnect();
}

module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}