import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to your new Amplify-powered account!',
      verificationEmailBody: (createCode) => `Complete your sign-up with the code ${createCode()}`,
    },
  },
  userAttributes: {
    fullname: {
      required: true,
    },
  },
  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
  },
  triggers: {
    postConfirmation,
  },
});
