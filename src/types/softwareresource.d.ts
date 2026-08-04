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

  /**
   * is API with payload response
   */
  isAPI?: boolean;

  /**
   * Use of PII
   */
  usePII?: boolean;

  /**
   * All PII-related fields, populated when usePII is true.
   */
  piiInformation?: {
    /**
     * Role of the data user with respect to GDPR.
     * Determines the contract template to use.
     */
    dataUserRole?: "dataController" | "dataProcessor" | "jointDataController";

    /**
     * Processing purpose(s) pursued by the service.
     */
    processingPurposes?: string[];

    /**
     * Legal basis for processing personal data (GDPR Art. 6).
     */
    legalBasis?: string;

    /**
     * Specific usage restrictions imposed on the data.
     */
    usageRestrictions?: string[];

    /**
     * DPO or contact point details on the provider side.
     */
    dpoContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };

    /**
     * Planned processing activities on personal data (simplified GDPR reference).
     */
    plannedProcessingActivities?: string[];

    /**
     * Categories of data being processed.
     */
    dataCategories?: string[];

    /**
     * Categories of data subjects concerned by the processing.
     */
    dataSubjectCategories?: string[];

    /**
     * Estimated data volume (in number of records / data subjects).
     */
    dataVolumeRange?:
      | "1-100"
      | "100-1000"
      | "1000-10000"
      | "10000-100000"
      | "100000-1000000"
      | "1000000+";

    /**
     * Sub-processors involved in the service offering.
     */
    subProcessorsInvolved?: object[];

    /**
     * Transfer of data outside the EEA.
     */
    transferOutsideEEA?: {
      hasTransfer: boolean;
      countries?: string[];
      activities?: string[];
      safeguards?: string[];
    };

    /**
     * Notice period (in business days) for changes to subsequent sub-processors.
     * Required if usePII = true AND dataUserRole = dataProcessor.
     */
    subsequentSubProcessingNoticePeriod?: number;

    /**
     * Assistance delay (in business days) for exercising data subject rights.
     * Required if usePII = true AND dataUserRole = dataProcessor.
     */
    dataSubjectRightsAssistanceDelay?: number;

    /**
     * Delay before notifying the data controller in case of a security breach.
     * Required if usePII = true AND dataUserRole = dataProcessor.
     */
    securityBreachAssistanceDelay?: "reasonableDelay" | "72h";

    /**
     * Notice period (in business days) before conducting an audit on personal data processing.
     * Required if usePII = true AND dataUserRole = dataProcessor.
     */
    auditNoticePeriod?: number;

    /**
     * Explicit authorization from the initial data controller allowing a subsequent
     * data controller to reuse data for their own compatible purposes.
     * Optional if dataUserRole = dataProcessor.
     */
    subsequentControllerReuseAuthorization?: {
      authorized: boolean;
      details?: string;
    };

    /**
     * Technical and organizational security measures implemented.
     * Required if usePII = true AND dataUserRole = dataProcessor.
     */
    securityMeasures?: object;

    /**
     * Security certification standards held by the sub-processor.
     */
    securityCertificationStandard?: (
      | "ISO27001"
      | "ISO27701"
      | "ISO9001"
      | "Europrivacy"
      | "SOC2"
      | "SECNUMCLOUD"
    )[];

    /**
     * Date of the latest security certification.
     */
    securityCertificationDate?: Date;

    /**
     * Expiry date of the security certification.
     */
    securityCertificationExpiryDate?: Date;
  };
}

export interface ISoftwareResourceMethods {}

export interface ISoftwareResourceModel
  extends Model<ISoftwareResource, object, ISoftwareResourceMethods> {}
