import mongoose from 'mongoose';
//definindo schema
const accountsSchema = mongoose.Schema({
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    min: 0,
  } /*,
  lastModified: {
    type: Date,
    default: Date.now,
  },*/,
});
//definindo modelo
const accountsModel = mongoose.model('accounts', accountsSchema, 'accounts');

export { accountsModel };
