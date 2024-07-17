import { Model } from "mongoose";
import { AllSchemas } from "./models";
import { VirtualResource } from "./virtualresource";

/**
 * A data resource is a subclass of virtual resource exposed through a service instance.
It’s also known as a Data Product as described in the Gaia-X Data Exchange specification document.

A data resource is extending the DCAT-3 Dataset class (https://www.w3.org/TR/vocab-dcat-3/#Class:Dataset) and primarily refers to an analytical dataset exposed via one or more InstantiatedVirtualResource service access points.

The data resource consists of the characterisation of the actual data as a description of the “contractual” part. At minimum, this self-description needs to contain all information so that a consumer can initiate a contract negotiation. All other attributes that are used to describe the data are optional. However, the provider has an interest to precisely describe the data so that it can be found and consumed. If the data resource is published in a catalogue, the data provider might precisely describe the data resource so that it can be found and consumed by data consumers.
 */
export interface IDataResource extends AllSchemas, VirtualResource {
  /**
   * A resolvable link to the participant self-description legally enabling the data usage
   * @specification Gaia-x
   */
  producedBy: string;

  /**
   * A resolvable link to the data exchange component that exposes the data resource.
   * @specification Gaia-x
   */
  exposedThrough: string[];

  /**
   * Date time in ISO 8601 format after which data is obsolete.
   * @specification Gaia-x
   */
  obsoleteDateTime?: string;

  /**
   * Date time in ISO 8601 format after which data is expired and shall be deleted.
   * @specification Gaia-x
   */
  expirationDateTime?: string;

  /**
   * Boolean determined by Participant owning the Data Resource
   * @specification Gaia-x
   */
  containsPII: boolean;

  /**
   * The category 'Global DataType' it belongs in
   * @specification VisionsTrust
   */
  category: string;

  /**
   * Representation of the resource
   */
  representation?: string;
}

export interface IDataResourceMethods {}

export interface IDataResourceModel
  extends Model<IDataResource, object, IDataResourceMethods> {}
