import { NextFunction, Request, Response } from "express";
import { SoftwareResource } from "../../../models";
import { buildResolvableSelfDescriptionURI } from "../../../libs/self-descriptions";
import { ResourceTypes } from "../../../libs/dcat/types";
import { mapCatalog } from "../../../libs/dcat";
import { Representation } from "../../../models/Representation";

const DEFAULT_QUERY_OPTIONS = {
  page: 0,
  limit: 50,
};

export const getSoftwareResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, page, providedBy } = req.query;
    const queryOptions: {
      limit: number;
      page: number;
      providedBy?: string;
    } = {
      ...DEFAULT_QUERY_OPTIONS,
      limit: parseInt(limit?.toString()) || 0,
      page: parseInt(page?.toString()) || 0,
      providedBy: providedBy?.toString() || "",
    };

    let countQuery = SoftwareResource.count();
    let query = SoftwareResource.find();

    if (queryOptions.providedBy) {
      countQuery = query.count({ providedBy: queryOptions.providedBy });
      query = query.where("providedBy").equals(queryOptions.providedBy);
    }

    const [resources, count] = await Promise.all([
      query
        .populate([{ path: "representation", model: Representation }])
        .limit(queryOptions?.limit)
        .skip(queryOptions?.page * queryOptions?.limit)
        .lean(),
      countQuery,
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
        result: resources.map((softwareResource) => ({
          ...softwareResource,
          copyrightOwnedBy: softwareResource.copyrightOwnedBy.map((v) =>
            buildResolvableSelfDescriptionURI("participants", v)
          ),
          providedBy: buildResolvableSelfDescriptionURI(
            "participants",
            softwareResource.providedBy
          ),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDCATSoftwareResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, page, providedBy } = req.query;
    const queryOptions: {
      limit: number;
      page: number;
      providedBy?: string;
    } = {
      ...DEFAULT_QUERY_OPTIONS,
      limit: parseInt(limit?.toString()) || 0,
      page: parseInt(page?.toString()) || 0,
      providedBy: providedBy?.toString() || "",
    };

    let countQuery = SoftwareResource.count();
    let query = SoftwareResource.find();

    if (queryOptions.providedBy) {
      countQuery = query.count({ providedBy: queryOptions.providedBy });
      query = query.where("providedBy").equals(queryOptions.providedBy);
    }

    const [resources, count] = await Promise.all([
      query
        .populate([{ path: "representation", model: Representation }])
        .limit(queryOptions?.limit)
        .skip(queryOptions?.page * queryOptions?.limit)
        .lean(),
      countQuery,
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
        result: mapCatalog(
          resources.map((softwareResource) => ({
            ...softwareResource,
            copyrightOwnedBy: softwareResource.copyrightOwnedBy.map((v) =>
              buildResolvableSelfDescriptionURI("participants", v)
            ),
            providedBy: buildResolvableSelfDescriptionURI(
              "participants",
              softwareResource.providedBy
            ),
          })),
          {
            title: "DataResource",
            description: "DataResource DCAT Catalog",
          },
          ResourceTypes.DataResource
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};
