import vars from "./vars.json";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.JITSI_DOMAIN) {
  throw new Error("JITSI_DOMAIN is not defined in the .env file!");
}

export const configs = {
  dialInNumbersUrl: process.env.DIALINNUMBER_URL,
  dialInConfCodeUrl: process.env.DIALINCONFCODE_URL,
  ENABLE_PHONE_ACCESS: process.env.ENABLE_PHONE_ACCESS,
  JITSI_DOMAIN: process.env.JITSI_DOMAIN,
  PHONE_NUMBER_FORMAT: process.env.PHONE_NUMBER_FORMAT,
  MODERATOR_OPTIONS: process.env.ENABLE_MODERATOR_OPTIONS,
  TITLE_MEETING_DETAILS: process.env.TITLE_MEETING_DETAILS,
  ADDIN_BASE_URL: process.env.ADDIN_BASE_URL,
};
