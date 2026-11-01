const mongoose = require('mongoose');

mongoose.connect(
  `mongodb://localhost:27017/${process.env.MONGO_DB}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = mongoose;