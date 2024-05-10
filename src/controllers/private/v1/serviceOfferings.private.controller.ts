import { NextFunction, Request, Response } from "express";
import { ServiceOffering } from "../../../models";
import { serviceOfferingPopulation } from "../../../utils/schemaPopulation";

const DEFAULT_QUERY_OPTIONS = {
  page: 0,
  limit: 50,
};

/**
 * Creates a new service offering
 */
export const createServiceOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceOffering = new ServiceOffering({
      ...req.body,
      providedBy: req.user.id,
    });
    await serviceOffering.save();

    return res.status(201).json(serviceOffering);
  } catch (err) {
    next(err);
  }
};

/**
 * Returns the service offerings for a specific participant
 */
export const getServiceOfferingsForParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await getParticipantServiceOfferings({
      req,
      participantId: req.params.id,
    });
    return res.json(payload);
  } catch (err) {
    next(err);
  }
};

/**
 * Gets all service offerings of the authenticated participant
 */
export const getSessionParticipantServiceOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await getParticipantServiceOfferings({
      req,
      participantId: req.user.id,
    });
    return res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const updateServiceOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedServiceOffering = await ServiceOffering.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedServiceOffering) {
      return res.status(404).json({
        code: 404,
        errorMsg: "Resource not found",
        message: "The service offering could not be found",
      });
    }

    return res.json(updatedServiceOffering);
  } catch (err) {
    next(err);
  }
};

export const deleteServiceOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceOffering = await ServiceOffering.findByIdAndDelete(
      req.params.id
    );
    if (!serviceOffering) {
      return res.status(404).json({
        code: 404,
        errorMsg: "Resource not found",
        message: "The service offering could not be found",
      });
    }

    return res
      .status(204)
      .json({ message: "Service offering deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getParticipantServiceOfferings = async ({
  req,
  participantId,
}: {
  req: Request;
  participantId: string;
}) => {
  const { limit, page, populated } = req.query;

  const queryOptions = {
    ...DEFAULT_QUERY_OPTIONS,
    limit: parseInt(limit?.toString()) || 0,
    page: parseInt(page?.toString()) || 0,
  };

  const query = { providedBy: participantId };
  const queryBuilder =
    populated === "true"
      ? ServiceOffering.find(query).populate(serviceOfferingPopulation)
      : ServiceOffering.find(query);

  const [serviceOfferings, count] = await Promise.all([
    queryBuilder
      .limit(queryOptions.limit)
      .skip(queryOptions.page * queryOptions.limit),
    ServiceOffering.countDocuments(query),
  ]);

  return {
    code: 200,
    data: {
      limit: queryOptions.limit,
      page: queryOptions.page,
      pages:
        count / queryOptions.limit < 1
          ? 1
          : Math.ceil(count / queryOptions.limit),
      count,
      result: serviceOfferings,
    },
  };
};
