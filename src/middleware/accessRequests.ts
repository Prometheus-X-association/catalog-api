import { NextFunction, Request, Response } from "express";
import {
  ecosystemAccessRequestInvitationSchema,
  ecosystemAccessRequestSchema,
  // @ts-ignore
} from "../libs/joi/ecosystemSchemas";

/**
 * Checks the body and determines if the request is
 * an invitation to an ecosystem or a participant initiating
 * an access request. Also sets the appropriate validation schema
 */
export const checkInviationOrAccessRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    if (body.ecosystem && body.participant) {
      req.validationSchema = ecosystemAccessRequestInvitationSchema;
    } else if (body.ecosystem && !body.participant) {
      req.validationSchema = ecosystemAccessRequestSchema;
    } else {
      throw new Error("Missing mandatory fields from body");
    }
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
