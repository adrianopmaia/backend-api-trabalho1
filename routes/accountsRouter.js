import express from 'express';
import { accountsModel } from '../model/accountsModel.js';
const app = express();
//CREATE
app.post('/accounts', async (req, res) => {
  try {
    const account = new accountsModel(req.body);
    await account.save();
    res.status(200).send(account);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//RETRIEVE
app.get('/accounts', async (req, res) => {
  try {
    const account = await accountsModel.find({});
    res.status(200).send(account);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//RETRIEVE 10
app.get('/accounts10', async (req, res) => {
  try {
    const account = await accountsModel.find({}).limit(10);
    res.status(200).send(account);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
//UPDATE
app.patch('/accounts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const account = await accountsModel.findByIdAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    console.log(account);
    if (!account) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send(account);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
//DELETE
app.delete('/accounts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const account = await accountsModel.findByIdAndDelete(
      { _id: id },
      req.body
    );
    if (!account) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send(account);
    }
    res.status(200).send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});
//Deposito
app.patch('/accountDeposito', async (req, res) => {
  try {
    const { agencia, conta, valor } = req.body;
    console.log(req.body);
    const account = await accountsModel.findOne({
      agencia: agencia,
      conta: conta,
    });
    account.balance += valor;
    const result = await accountsModel.findByIdAndUpdate(
      { _id: account._id },
      account,
      {
        new: true,
      }
    );
    if (!account) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send({ ok: result.balance });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
//Saque
app.patch('/accountSaque', async (req, res) => {
  try {
    const { agencia, conta, valor } = req.body;
    const account = await accountsModel.findOne({
      agencia: agencia,
      conta: conta,
    });
    if (account.balance - valor - 1 < 0) {
      throw new Error('saldo insuficente para a transação');
    }

    account.balance -= valor + 1;

    const result = await accountsModel.findByIdAndUpdate(
      { _id: account._id },
      account,
      {
        new: true,
      }
    );
    if (!account) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send({ ok: result.balance });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//SALDO
app.get('/accountSaldo', async (req, res) => {
  try {
    const { agencia, conta } = req.query;

    const account = await accountsModel.findOne({
      agencia: parseInt(agencia),
      conta: parseInt(conta),
    });

    if (!account) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send({ OK: account.balance });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
//Apagar conta e exibir ativas
app.delete('/accountDelete', async (req, res) => {
  try {
    const { agencia, conta } = req.query;
    console.log('pegar conta');
    const account = await accountsModel.findOne({
      agencia: agencia,
      conta: conta,
    });
    //fazer o findByIdandDelete
    await accountsModel.findByIdAndDelete({ _id: account._id });
    const result = await accountsModel.find({
      agencia: agencia,
    });

    if (!account) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send({ OK: result.length });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
app.patch('/accountTransfer', async (req, res) => {
  try {
    const { contaO, contaD, valor } = req.body;
    const accountO = await accountsModel.findOne({
      conta: contaO,
    });

    const accountD = await accountsModel.findOne({
      conta: contaD,
    });

    let transferencia = valor;

    if (accountO.agencia !== accountD.agencia) transferencia += 8;

    if (accountO.balance - transferencia >= 0) {
      accountO.balance -= transferencia;
      accountD.balance += valor;
      //atualiza as contas
      await accountsModel.findByIdAndUpdate({ _id: accountO._id }, accountO);
      await accountsModel.findByIdAndUpdate({ _id: accountD._id }, accountD);
    } else {
      console.log('saldo insuficiente');
    }

    if (!accountO) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send({ OK: accountO.balance });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//SALDO
app.get('/accountMedia/:id', async (req, res) => {
  try {
    const agencia = req.params.id;
    const accounts = await accountsModel.find({ agencia: agencia });
    const total = accounts.length;
    const soma = accounts.reduce((acc, cur) => acc + cur.balance, 0);
    const media = soma / total;

    if (!media) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send({ OK: media.toFixed(2) });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/accountMenores/:qtd', async (req, res) => {
  try {
    const qtd = req.params.qtd;
    console.log(qtd);
    const accounts = await accountsModel
      .find({})
      .limit(parseInt(qtd))
      .sort({ balance: 1 });

    if (!accounts) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send(accounts);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/accountMaiores/:qtd', async (req, res) => {
  try {
    const qtd = req.params.qtd;
    console.log(qtd);
    const accounts = await accountsModel
      .find({})
      .limit(parseInt(qtd))
      .sort({ balance: -1 });

    if (!accounts) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send(accounts);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get('/accountPrivate', async (req, res) => {
  try {
    const agencias = await accountsModel.aggregate([
      {
        $group: {
          _id: {
            agencia: '$agencia',
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const qtd = agencias.length;

    const accounts = await accountsModel
      .aggregate([
        {
          $group: {
            _id: { agencia: '$agencia' },
            value: { $max: '$balance' },
          },
        },
      ])
      .limit(parseInt(qtd))
      .sort({ balance: -1 });

    const a = await accountsModel.aggregate([
      { $sort: { balance: -1 } },
      {
        $group: {
          _id: '$agencia',
          max: { $max: '$balance' },
        },
      },
      { $limit: qtd },
      {
        $project: {
          _id: '$_id',
        },
      },
    ]);
    for (let i = 0; i < a.length; i++) {
      let b = await accountsModel
        .find({ agencia: a[i]._id })
        .sort({ balance: -1 })
        .limit(1);
      //b.agencia = 99;
      console.log('b' + i);
      b[0].agencia = 99;
      await accountsModel.findByIdAndUpdate({ _id: b[0]._id }, b[0]);
      //console.log(b);
    }

    if (!accounts) {
      res.status(404).send('Documento não encontrado na coleção');
    } else {
      res.status(200).send(accounts);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
export { app as accountsRouter };
