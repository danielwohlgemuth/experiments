# MuleSoft with Salesforce integration

This project shows how to use MuleSoft to integrate with Salesforce. It exposes a CRUD (create, read, update, delete) API to interact with account records stored in Salesforce.

![account api](/2025/mulesoft-salesforce-integration/assets/account-api.png)

## Prerequisites

- [Salesforce developer account](https://developer.salesforce.com/) / [Trailhead org](https://trailhead.salesforce.com/)
- Java runtime (try [Temurin from Adoptium](https://adoptium.net/))
- [MuleSoft's Secure Properties Tool](https://docs.mulesoft.com/mule-runtime/latest/secure-configuration-properties#secure_props_tool)
- [Anypoint Studio](https://www.mulesoft.com/lp/dl/anypoint-mule-studio)
- [Postman](https://www.postman.com/downloads/) (optional)
- cURL

## Setup

### Salesforce

We will need the username, password, and security token from the Salesforce org to be able to interact with Salesforce from MuleSoft.

If you are using a Trailhead org, you can set your password by going to the `Playground Starter` app, go to the `Get Your Login Credentials` tab, and click on the `Reset My Password` button. Follow the instructions in the email to finish setting the password.

Once you have your username and password, get your security token by clicking on your profile picture on the top right, click `Settings`, and in the `Reset My Security Token` tab, click the `Reset Security Token` button. You should get an email with the new security token.

Note that changing the password resets the security token, so the previous step would need to be repeated after the password changes.

We will also need to upload our Apex class to Salesforce. To do this, go to click the gear icon in the top right corner and then click `Developer Console`. This will open a window where you can click on the `File` menu, hover over `New`, and click `Apex Class`. Enter `AccountApi` as the name and click `OK`. Copy and paste the content of ![AccountApi.cls](2025/mulesoft-salesforce-integration/AccountApi.cls). Save the document by clicking on the `File` menu and then `Save`.

![salesforce developer console](/2025/mulesoft-salesforce-integration/assets/salesforce-developer-console.png)

### Encrypt Secrets

Next, we want to encrypt secrets like the password and security token so we can safely commit them without exposing them. For this, we use the Secure Properties Tool provided by MuleSoft.

The following shows an example of how it can be used, with `MyMuleSoftKey123` being the key that we need to avoid commiting in code, and `mule` being the secret we want to encrypt.

```bash
java -cp secure-properties-tool.jar com.mulesoft.tools.SecurePropertiesTool \
string \
encrypt \
AES \
CBC \
MyMuleSoftKey123 \
"mule"
```

This outputs the string `9NH7VahEt2/A3UmvgZvs5Q==`. We will use the encrypted password and security token in the next setup.

Note that the AES encryption algorithm expects the key to be exactly 16 characters.

### Anypoint Studio

Now, we are going to set up the MuleSoft project in Anypoint Studio.

The first step is to import the project. To do this, click on `Import projects...` in the `Package Explorer` widget or go to `File` -> `Import...`.
In the import window, expand the `General` folder, `Projects from Folder or Archive`, and click `Next`. Click `Directory...`, select the [accountapi](/2025/mulesoft-salesforce-integration/accountapi) folder, and then click `Finish`.

Before we can run the project, we need to set up the credentials. There are 3 places for this: `dev.properties`, `dev.secure.properties` (both can be found in the `accountapi/src/main/resources` folder), and the run configuration.

In `dev.properties` we set the value for `salesforce.username` and potentially update the version number for `salesforce.authorizationUrl`. In `dev.secure.properties` we set the `salesforce.password` and `salesforce.securityToken` values using the encrypted secrets from the previous section.

We use the run configuration to set the key that will allow the encrypted secrets to be decrypted at runtime. Right-click the project in the `Package Explorer` widget, hover over `Run As`, and click `Run Configurations...`. In the Run Configurations window, right-click the `Mule Applications` and click `New Configuration`. Change the name to `accountapi` and select `accountapi` in the `General` tab. Switch to the `Environment` tab, click `Add...`, set `Name` to `secure.key`, `Value` to the key used to encrypt the secrets (in this example `MyMuleSoftKey123`), and click `OK`.

![anypoint studio run configuration](/2025/mulesoft-salesforce-integration/assets/anypoint-studio-run-configuration.png)

Click `Apply` and then `Run`. If there is a message saying there is an instance that's already running, asking to stop the running app and start accountapi, click `Yes`.

After a few seconds you should see the app running and be able to click `Open console` in the `APIkit Consoles` widget to interact with the browser.

![apikit console](/2025/mulesoft-salesforce-integration/assets/apikit-console.png)

### Postman

Postman can be used as an alternative to APIkit Console. One advantage it has is that it lets you store a value from one request and use it in another request. In this project it's used to store the account ID of the first account created with the Create Account API and use the stored value in the Update Account and Delete Account APIs.

Use the [Account API.postman_collection.json](/2025/mulesoft-salesforce-integration/AccountAPI.postman_collection.json) file to import the Account API definition as a collection into Postman.

![postman](/2025/mulesoft-salesforce-integration/assets/postman.png)

## Cleanup

To make the Salesforce credentials unusable, reset your password in your Trailhead Salesforce org by going to the `Playground Starter` app, go to the `Get Your Login Credentials` tab, and click on the `Reset My Password` button. Follow the instructions in the email to finish resetting the password.

## Helpful resources
- https://developer.mulesoft.com/tutorials-and-howtos/quick-start/getting-started-with-salesforce-integration-patterns-using-mulesoft/
- https://docs.mulesoft.com/salesforce-connector/latest/
- https://docs.mulesoft.com/salesforce-connector/latest/salesforce-connector-examples
