const request = require('request');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

var api = require("./api.js")
api.init();

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/api/balance/:address', (req, res) => 
        api.getBalance(req.params["address"]).then(function(result) {
          res.send({"total" : result});
        }));

app.get('/api/total', (req, res) => 
        api.getTotalTokens().then(function(result) {
          res.send({"total" : result});          
        }));

app.get('/api/dividends/:address', (req, res) =>
        api.getOutstandingDividends(req.params["address"]).then(function(result) {
          res.send({"owed" : result});
        }));

app.get('/api/pay/:address', (req, res) =>
        api.payOutstandingDividends(req.params["address"], function (value) {console.log(value);} ).then(function(result) {
          res.send(result);
        }));

app.post('/api/pay/', (req, res) => {
  var params = req.body;
  var address = params['address'];
  var callback = params['callback'];
  var created = Date.now;
  var completed = 0;

  api.payOutstandingDividends(address, function(value) {
    console.log(value);
    completed = Date.now;
  }).then(function(result) {
    request.post(address,
                 {json: {"success" : value,
                         "completed" : completed,
                         "created" : created}},
                 function (error, response, body) {
                   if (!error && response.statusCode == 200) {
                     console.log(body)
                   }
                 });
  })});


app.get('/api/mint/:address/:amount', (req, res) => {
  var address = req.params["address"];
  var amount = req.params["amount"];
  api.mintTokens(address, amount, function (minted) {
    console.log("minted = " + minted)}).then(function(result) {
      res.send(result);
    })});

app.post('/test/callback', (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

app.post('/api/mint/:address/:amount', (req, res) => {});

app.listen(3000, () => console.log('API active on port 3000!'))
