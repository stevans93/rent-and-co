import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_KEY } from "../config/config";
import { BadRequestError } from "./errors";

export function createToken(payload: object): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!JWT_KEY) {
      reject(new BadRequestError("JWT_KEY is missing"));
      return;
    }

    jwt.sign(payload, JWT_KEY, { expiresIn: JWT_EXPIRES_IN }, (err, token) => {
      if (err) {
        reject(err);
      }

      resolve(token as string);
    });
  });
}
