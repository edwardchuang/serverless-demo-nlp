const functions = require('firebase-functions');
const language = require('@google-cloud/language').v1beta2;
const client = new language.LanguageServiceClient({projectId: 'serverless-demo-49cb3', keyFilename: 'serverless-demo-49cb3-208a1e50d811.json'});

exports.processNLP = functions.https.onRequest((request, response) => {
    var content = request.body.content;
    var language = request.body.language || "en";

    const document = {
        content: content,
        type: 'PLAIN_TEXT',
        language: language
    };

    console.log(document);
    response.header('Content-Type','application/json');

    client
    .analyzeSentiment({"document": document, "encodingType": "UTF8"})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      var ret = {'error': 0, 'score': sentiment.score, 'magnitude': sentiment.magnitude, 'debug': sentiment};
      response.send(JSON.stringify(ret));;

      // TODO: put to firestore and pubsub then bq (?)
    })
    .catch(err => {
      console.error('ERROR:', err);
      var ret = {'error': err.code};
      response.status(400).send(JSON.stringify(ret));
    });
});
