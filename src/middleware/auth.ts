// Authentication will be reworked when integrating Verifiable Credentials
// For now a simple JWT is used to simulate

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CONFIG } from "../config/environment";
import { Participant } from "../models";

type DecodedServiceJWT = {
  serviceKey: string;
};

export const verifyJwtMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.slice(7);

  const data = token.split(".");

  if (data.length < 3) {
    return res.status(401).json({
      message: "'" + token + "' is not a valid authorization token",
    });
  }

  const buff = Buffer.from(data[1], "base64");
  const authObject: DecodedServiceJWT = JSON.parse(buff.toString());

  const { serviceKey } = authObject;

  if (serviceKey) {
    const participant = await Participant.findOne({
      serviceKey: serviceKey,
    }).lean();

    try {
      const decoded = jwt.verify(
        token,
        participant.serviceSecretKey
      ) as JwtPayload;
      if (decoded) {
        req.serviceKey = serviceKey;
        req.decodedToken = decoded;
        req.user = {
          id: participant._id.toString(),
        };
        return next();
      } else {
        return res.status(401).json({
          error: "token-decode-error",
          message: "Unauthorized resource",
        });
      }
    } catch (error) {
      return res
        .status(401)
        .json({ error: error, message: "Unauthorized resource" });
    }
  } else {
    try {
      const decodedToken = jwt.verify(token, CONFIG.jwtSecretKey) as JwtPayload;

      req.decodedToken = decodedToken;
      req.user = {
        id: decodedToken.sub,
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }
};
