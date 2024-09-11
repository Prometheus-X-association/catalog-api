import { NextFunction, Request, Response } from "express";
import {
  DataResource,
  Ecosystem,
  Participant,
  ServiceOffering,
  SoftwareResource,
} from "../../../models";
import { CONFIG } from "../../../config/environment";

const DEFAULT_QUERY_OPTIONS = {
  page: 0,
  limit: 50,
};

/**
 * Returns service offerings that have a data resource associated to the
 * specify category
 */
export const getDataServiceOfferingsForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const { limit, page } = req.query as { limit: string; page: string };
    const queryOptions: { limit: number; page: number } = {
      limit: parseInt(limit?.toString()) || DEFAULT_QUERY_OPTIONS.limit,
      page: parseInt(page?.toString()) || DEFAULT_QUERY_OPTIONS.page,
    };

    const dataResources = await DataResource.find({
      category: category,
    });

    const [count, result] = await Promise.all([
      ServiceOffering.countDocuments({
        dataResources: { $in: dataResources.map((d) => d._id) },
      }),
      ServiceOffering.find({
        dataResources: { $in: dataResources.map((d) => d._id) },
      })
        .limit(queryOptions.limit)
        .skip(queryOptions.page * queryOptions.limit)
        .lean(),
    ]);

    return res.json({
      data: {
        limit: queryOptions.limit,
        page: queryOptions.page,
        pages:
          count / queryOptions.limit < 1
            ? 1
            : Math.ceil(count / queryOptions.limit),
        count: count,
        result: result,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Returns service offerings that have a data resource associated to the
 * specify category
 * @author Felix Bole
 */
export const getSoftwareServiceOfferingsForCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const { limit, page } = req.query as { limit: string; page: string };
    const queryOptions: { limit: number; page: number } = {
      limit: parseInt(limit?.toString()) || DEFAULT_QUERY_OPTIONS.limit,
      page: parseInt(page?.toString()) || DEFAULT_QUERY_OPTIONS.page,
    };

    const softwareResources = await SoftwareResource.find({
      category: category,
    });

    const [count, result] = await Promise.all([
      ServiceOffering.countDocuments({
        softwareResources: { $in: softwareResources.map((d) => d._id) },
      }),
      ServiceOffering.find({
        softwareResources: { $in: softwareResources.map((d) => d._id) },
      })
        .limit(queryOptions.limit)
        .skip(queryOptions.page * queryOptions.limit)
        .lean(),
    ]);

    return res.json({
      data: {
        limit: queryOptions.limit,
        page: queryOptions.page,
        pages:
          count / queryOptions.limit < 1
            ? 1
            : Math.ceil(count / queryOptions.limit),
        count: count,
        result: result,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Returns all participants with Pagination
 */
export const getParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, page } = req.query;
    const queryOptions: {
      limit: number;
      page: number;
    } = {
      ...DEFAULT_QUERY_OPTIONS,
      limit: parseInt(limit?.toString()) || 0,
      page: parseInt(page?.toString()) || 0,
    };

    const [participants, count] = await Promise.all([
      Participant.find()
        .limit(queryOptions?.limit)
        .select("-serviceKey -serviceSecretKey")
        .skip(queryOptions?.page * queryOptions?.limit),
      Participant.count(),
    ]);

    return res.json({
      data: {
        limit: queryOptions.limit,
        page: queryOptions.page,
        pages:
          count / queryOptions.limit < 1
            ? 1
            : Math.ceil(count / queryOptions.limit),
        count,
        result: participants,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get an ecosystem self-description by ID
 */
export const getEcosystemSD = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ecosystem = await Ecosystem.findById(req.params.id).lean();
    const result = {
      "@context": CONFIG.apiUrl + "/ecosystem",
      "@type": "Ecosystem",
      ...ecosystem,
    };
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a data resource self-description by ID
 */
export const getDataResourceSD = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resource = await DataResource.findById(req.params.id).lean();
    const result = {
      "@context": CONFIG.apiUrl + "/dataresource",
      "@type": "DataResource",
      ...resource,
    };
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a software resource self-description by ID
 */
export const getSoftwareResourceSD = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resource = await SoftwareResource.findById(req.params.id).lean();
    const result = {
      "@context": CONFIG.apiUrl + "/softwareresource",
      "@type": "SoftwareResource",
      ...resource,
    };
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a participant self-description by ID
 */
export const getParticipantSD = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .select("-serviceKey -serviceSecretKey")
      .lean();
    const result = {
      "@context": CONFIG.apiUrl + "/participant",
      "@type": "Participant",
      ...participant,
    };
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a service offering self-description by ID
 */
export const getServiceOfferingSD = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceOffering = await ServiceOffering.findById(
      req.params.id
    ).lean();

    const result = {
      "@context": CONFIG.apiUrl + "/serviceoffering",
      "@type": "ServiceOffering",
      ...serviceOffering,
    };
    return res.json(result);
  } catch (err) {
    next(err);
  }
};
