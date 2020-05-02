import { config } from "dotenv";
import Logger from "@/services/logger";

const configs = {
  port: 3000,
  isProduction: false,
  secretAlgorithm: "HS256",
  secretKey: "default",
  mongodbUri: "",
};

export function setConfig(key, value) {
  if (key && value) {
    Logger.log(
      `Configuration update at ${key} by: ${typeof configs[key]} --> ${typeof value}`
    );
    configs[key] = value;
  }
}

export function init() {
  config();

  setConfig("port", +process.env.PORT);
  setConfig("isProduction", process.env.ENV_MODE === "prod");
  setConfig("secretKey", process.env.USER_TOKEN_SECRET);
  setConfig("secretAlgorithm", process.env.TOKEN_ALGORITHM);
  setConfig("mongodbUri", process.env.MONGODB_URI);
}

export default configs;
