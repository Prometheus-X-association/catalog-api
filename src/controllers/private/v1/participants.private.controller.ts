import { NextFunction, Request, Response } from "express";
import {
  DataResource,
  Participant,
  ServiceOffering,
  SoftwareResource,
} from "../../../models";
import { urlChecker } from "../../../utils/urlChecker";
import { makeId } from "../../../utils/idGenerator";

/**
 * Post a data space connector
 */
export const postDataSpaceConnector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appKey, endpoint } = req.body;

    const participant = await Participant.findOne({
      serviceKey: req?.serviceKey,
    });

    if (
      !participant.dataspaceConnectorAppKey ||
      !participant.dataspaceEndpoint ||
      participant.dataspaceConnectorAppKey !== appKey ||
      participant.dataspaceEndpoint !== endpoint
    ) {
      participant.dataspaceConnectorAppKey = appKey;
      participant.dataspaceEndpoint = endpoint;

      participant.urls.consentExport = urlChecker(endpoint, "consent/export");
      participant.urls.consentImport = urlChecker(endpoint, "consent/import");
      participant.urls.dataExport = urlChecker(endpoint, "data/export");
      participant.urls.dataImport = urlChecker(endpoint, "data/import");

      await participant.save();
    }

    const serviceOffering = await ServiceOffering.find({
      providedBy: participant._id,
    }).lean();
    const softwareResources = await SoftwareResource.find({
      providedBy: participant._id,
    }).lean();
    const dataResources = await DataResource.find({
      producedBy: participant._id,
    }).lean();

    const catalog = {
      serviceOfferings: serviceOffering,
      softwareResources: softwareResources,
      dataResources: dataResources,
      participant,
    };

    return res.json(catalog);
  } catch (err) {
    next(err);
  }
};

/**
 * Check a data space connector
 */
export const checkDataSpaceConnector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appKey, endpoint } = req.body;

    const participant = await Participant.findOne({
      serviceKey: req?.serviceKey,
      dataspaceConnectorAppKey: appKey,
      dataspaceEndpoint: endpoint,
    }).lean();

    if (!participant) {
      return res.status(200).json({
        dataspaceConnectorRegistered: false,
      });
    } else {
      return res.status(200).json({
        dataspaceConnectorRegistered: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Generate API key for participant without API Key
 */
export const generateAPIKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participant = await Participant.findById(req.user?.id);

    if (!participant) {
      return res.status(404).json({
        code: 404,
        errorMsg: "Participant not found",
        message: "The participant doesn't exist.",
      });
    }

    if (participant.serviceKey && participant.serviceSecretKey) {
      return res.status(400).json({
        code: 404,
        errorMsg: "Key already generated",
        message: "The API Key have already been generated.",
      });
    }

    participant.serviceKey = makeId();
    participant.serviceSecretKey = makeId();

    await participant.save();

    return res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
};

/**
 * Get API Key
 */
export const getAPIKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participant = await Participant.findById(req.user?.id).select(
      "serviceKey serviceSecretKey"
    );

    if (!participant) {
      return res.status(404).json({
        code: 404,
        errorMsg: "Participant not found",
        message: "The participant doesn't exist.",
      });
    }

    return res.status(200).json(participant);
  } catch (err) {
    next(err);
  }
};
