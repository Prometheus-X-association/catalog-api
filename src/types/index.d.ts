import "express";
import { JwtPayload } from "jsonwebtoken";

import Joi from "joi";
import { IParticipant } from "./participant";
import { IEcosystem } from "./ecosystem";

declare module "express" {
  interface Request {
    decodedToken?: JwtPayload;
    user?: {
      id: string;

      /**
       * Only available on handlers that come
       * after usePopulatedUser
       */
      populated?: IParticipant;
    };

    /**
     * Available after a successful ownership
     * verification on a PUT request
     */
    ecosystem?: IEcosystem;

    validationSchema?: Joi.ObjectSchema;

    /**
     * Participant API Key to authenticate
     */
    serviceKey?: string;
  }
}
