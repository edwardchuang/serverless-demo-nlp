const functions = require('firebase-functions');
const admin = require('firebase-admin');
const language = require('@google-cloud/language').v1beta2;
const PubSub = require('@google-cloud/pubsub');
const BigQuery = require('@google-cloud/bigquery');
const client = new language.LanguageServiceClient({
    projectId: process.env.GCLOUD_PROJECT, 
    credentials: functions.config().credential
});

const pubsubClient = new PubSub({
    projectId: process.env.GCLOUD_PROJECT, 
    credentials: functions.config().credentials
});
const bigqueryClient = new BigQuery({
    projectId: process.env.GCLOUD_PROJECT, 
    credentials: functions.config().credentials
});

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
      var remoteIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
      var ret = {
          'error': 0, 
          'score': sentiment.score, 
          'magnitude': sentiment.magnitude, 
          'debug': sentiment,
          'timestamp': new Date().toISOString()
      };
      var pubsubData = ret;
      pubsubData.remoteIp = remoteIp;
      pubsubData.originText = content;
      pubsubData.debug = JSON.stringify(sentiment);

      var updateFirestore = _updateFirestore(ret);
      var updatePubSub = _updatePubSub(JSON.stringify(pubsubData));

      Promise.all([updateFirestore, updatePubSub]).then((values) => {
        console.log(values);
        ret.id = values[0];
        ret.mid = values[1];
        return response.send(JSON.stringify(ret));
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
      var ret = {'error': err.code};
      return response.status(400).send(JSON.stringify(ret));
    });
});

exports.workerBigQuery = functions.https.onRequest((request, response) => {
    if (!request.body || !request.body.message || !request.body.message.data) {
        logging.warn('Bad request');
        return response.sendStatus(400);
      }
    
      const dataUtf8encoded = Buffer.from(request.body.message.data, 'base64').toString('utf8');
      var content;
      try {
        content = JSON.parse(dataUtf8encoded);
      } catch (ex) {
        console.log('Bad request');
        return response.sendStatus(400);
      }

      bigqueryClient.dataset('sentiment').table('log').insert([content])
      .then(() => {
        console.log(`Inserted 1 rows`);
        return response.send('OK');
      }).catch(err => {
        if (err && err.name === 'PartialFailureError') {
            if (err.errors && err.errors.length > 0) {
                console.log('Insert errors:');
                err.errors.forEach(err => console.error(err));
            }
        } else {
            console.error('ERROR:', err);
        }
        return response.sendStatus(400);
      });
      
});
