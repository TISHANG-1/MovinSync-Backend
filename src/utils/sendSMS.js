import twilio from "twilio";

export const sendSMS = async (options) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);
  client.messages
    .create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${options.phoneNumber}`,
    })
    .then((message) => console.log(message.sid))
    .catch((error) => {
      console.error(error);
    });
};
