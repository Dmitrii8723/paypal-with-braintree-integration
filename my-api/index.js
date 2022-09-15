const express = require('express')
const cors = require('cors');
const braintree = require("braintree");
const app = express()
const port = 3005

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "merchantId",
  publicKey: "publicKey",
  privateKey: "privateKey",
});

app.use(cors({
    origin: '*'
}));

app.get('/client_token', (req, res) => {
    gateway.clientToken.generate({}).then(response => {
     console.log('response.clientToke', response.clientToken)
      res.send({ clientToken: response.clientToken });
    });
  });

app.post('/create-transaction', (req, res) => {
    console.log('JSON.parse(req.headers.body)', JSON.parse(req.headers.body))
    const parsedBody = JSON.parse(req.headers.body)
    gateway.transaction
  .sale({
    paymentMethodNonce: parsedBody.paymentMethodNonce,
    amount: parsedBody.amount,
    orderId: parsedBody.orderId,
  options: {
    submitForSettlement: true,
    storeInVaultOnSuccess: true,
    paypal: {
      customField: "PayPal custom field",
      description: "Description for PayPal email receipt",
    },
}
  })
  .then(function (result) {
    if (result.success) {
      console.log('RESULT', result);
      console.log("Transaction ID: " + result.transaction.id);
    } else {
      console.error(result.message);
    }
    res.send('DONE!')
  })
  .catch(function (err) {
    console.error(err);
  });
  })

  app.post('/create-token-transaction', (req, res) => {
    gateway.transaction
  .sale({
    amount: "1000.00",
    paymentMethodToken: "nonce-from-the-client",
    options: {
        submitForSettlement: true,
        paypal: {
          customField: "PayPal custom field",
          description: "Description for PayPal email receipt",
        },
    }
  })
  .then(function (result) {
    if (result.success) {
      console.log('RESULT', result);
      console.log("Transaction ID: " + result.transaction.id);
    } else {
      console.error(result.message);
    }
    res.send('DONE!')
  })
  .catch(function (err) {
    console.error(err);
  });
  })


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
