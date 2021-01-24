# client

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Deploy to AWS
Deploy done using AWS Amplify

* Visit  https://console.aws.amazon.com/amplify/home

New App -> Host Web App
* Pick GitHub
* Authorize access to your github repo. Need to be admin
* select branch to deploy
* leave "Monorepo"- No. We build from the root folder

* Step 2. Configure Build settings
	* click edit for "build and test settings" and paste amplify.json file content
	* populate env variables for the following vars
	
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
PLAID_CLIENT_ID
PLAID_COUNTRY_CODES
PLAID_ENV
PLAID_PRODUCTS
PLAID_SECRET
VUE_APP_BASE_URL
```	
	
* After the app is create make sure to specify the new domain for your client as a valid JavasCript origin for your OAuth in google console	