# serverless-demo-nlp
GCP Serverless Demo with Firebase and Natural Language API

This is a simple chatroom-style demo site for displaying Natural Language API serverlessly by using Firebase Cloud Functions

Credential Setup:

1. Create a service account and download the key in JSON format
2. Setup the firebase config by:

`% firebase functions:config:set credentials.client_email=*service account email*`

`% firebase functions:config:set credentials.private_key="*private key content in JSON*"`

3. Apply the credential config locally 

`% firebase functions:config:get > .runtimeconfig.json`

Put the .runtimeconfig.json to the *functions* directory before running firebase serve command.
