import { Model, Types } from "mongoose";
import { AllSchemas } from "./models";
import { VirtualResource } from "./virtualresource";

/**
 * The Software resource is not yet defined specifically by Gaia-x.
 *
 * However, this should be considered as a "Service" in the sense of
 * a participant's data-processing service / software. This will then be
 * aggregated into a ServiceOffering
 */
export interface ISoftwareResource extends AllSchemas, VirtualResource {
  /**
   * Provider of the software resource
   */
  providedBy: string;

  /**
   * A resolvable link to the data exchange component that exposes the software
   * @specification Gaia-x
   */
  exposedThrough: string[];

  /**
   * Prometheus-X service category it is related to
   */
  category?: string;

  /**
   * a list of physical locations in ISO 3166-2 alpha2, alpha-3 or numeric format.
   */
  locationAddress: {
    countryCode: string;
  }[];

  /**
   * Number of users or clients the service has
   */
  users_clients?: number;

  /**
   * Link to demo or documentation
   */
  demo_link?: string;

  /**
   * Link to relevant project or use case
   */
  relevant_project_link?: string;

  /**
   * Representation of the resource
   */
  representation?: string;
}

export interface ISoftwareResourceMethods {}

export interface ISoftwareResourceModel
  extends Model<ISoftwareResource, object, ISoftwareResourceMethods> {}
