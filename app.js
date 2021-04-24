import mongoose from 'mongoose';
import express from 'express';
import { accountsRouter } from './routes/accountsRouter.js';
import dotenv from 'dotenv';
dotenv.config();
//console.log(process.env.USER_DB);
(async () => {
  try {
    console.log('Conectando a MongoDB Atlas');
    await mongoose.connect(
      `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.m9ih6.mongodb.net/bootcamp?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('MongoDB Atlas Conectado');
  } catch (error) {
    'Erro ao conectar ao MongoDb Atlas ' + error;
  }
})();

const app = express();

app.use(express.json());
app.use(accountsRouter);
app.listen(process.env.PORT, () => {
  console.log('Api rodando man');
});
