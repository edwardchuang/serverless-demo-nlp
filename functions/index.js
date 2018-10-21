const functions = require('firebase-functions');
const admin = require('firebase-admin');
const language = require('@google-cloud/language').v1beta2;
const client = new language.LanguageServiceClient({projectId: 'serverless-demo-49cb3', keyFilename: 'serverless-demo-49cb3-208a1e50d811.json'});
const PubSub = require('@google-cloud/pubsub');
const pubsubClient = new PubSub({projectId: 'serverless-demo-49cb3', keyFilename: 'serverless-demo-49cb3-208a1e50d811.json'});

admin.initializeApp(functions.config().firebase);
const settings = {timestampsInSnapshots: true};
var db = admin.firestore();
db.settings(settings);

exports.processNLP = functions.https.onRequest((request, response) => {
    var content = request.body.content;
    var language = request.body.language || "en";

    const document = {
        content: content,
        type: 'PLAIN_TEXT',
        language: language
    };

    var _updateFirestore = (data) => {
        return new Promise((resolve, reject) => {
            db.collection("sentimentwall").add(data).then(ref => {
                resolve(ref.id);
            }).catch(err => {
                reject(err)
            });
        });
    }

    var _updatePubSub = (data) => {
        return new Promise((resolve, reject) => {
            const dataBuffer = Buffer.from(data);
            pubsubClient
              .topic('sentiment')
              .publisher()
              .publish(dataBuffer)
              .then(messageId => {
                resolve(messageId);
              })
              .catch(err => {
                reject(err);
              });
        });
    }

    console.log(document);
    response.header('Content-Type','application/json');

    client
    .analyzeSentiment({"document": document, "encodingType": "UTF8"})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      var ret = {
          'error': 0, 
          'score': sentiment.score, 
          'magnitude': sentiment.magnitude, 
          'debug': sentiment,
          'timestamp': new Date().toISOString()
      };

      var updateFirestore = _updateFirestore(ret);
      var updatePubSub = _updatePubSub(JSON.stringify(ret));

      Promise.all([updateFirestore, updatePubSub]).then((values) => {
        console.log(values);
        ret.id = values[0];
        ret.mid = values[1];
        response.send(JSON.stringify(ret));
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
      var ret = {'error': err.code};
      response.status(400).send(JSON.stringify(ret));
    });
});
