import { Model, Schema } from "mongoose";
import { AllSchemas } from "./models";

export type PersonalDataProtectionRegimes =
  | "GDPR2016"
  | "LGPD2019"
  | "PDPA2012"
  | "CCPA2018"
  | "VCDPA2021";

export type SLAAvailability =
  | "Best effort"
  | "99%"
  | "99.5%"
  | "99.9%"
  | "99.95%"
  | "99.99%";

export type SLAUpdateFrequency =
  | "Real-time / streaming"
  | "Hourly"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "On request"
  | "Static (no update)";

export type SLASupportChannel =
  | "Email"
  | "Phone"
  | "Chat"
  | "Ticketing portal"
  | "Slack"
  | "Community forum"
  | "Dedicated CSM";

export type ISLA = {
  deliveryDeadline?: {
    value: number;
    unit: "hours" | "business days" | "calendar days";
  };
  availability?: SLAAvailability;
  updateFrequency?: SLAUpdateFrequency;
  responseTime?: {
    value: number;
    unit: "ms" | "s";
    measurementBasis: "Average" | "p95" | "p99";
  };
  availabilityTimeWindow?: {
    value: "24/7" | "Business hours 5x8" | "Extended 5x12";
    timezone?: string;
  };
  retentionPeriod?: number
  availabilityPeriod?:
    | 'Session only'
    | '30 days'
    | '90 days'
    | '1 year'
    | 'Contract duration'
    | 'Until consent withdrawal';
  endOfSupportDate?:
    |'Contract duration'
    | '10 days after contract ends'
    | '30 days after contract ends';
  endOfLifeDate?:
    | 'Contract duration'
    | '10 days after contract ends'
    | '30 days after contract ends'
  supportChannels?: SLASupportChannel[];
  supportServiceHours?: "24/7" | "Business hours 5x8" | "Extended 5x12";
  supportSeverityLevel?: {
    level: "Critical" | "High" | "Medium" | "Low";
    responseTimeValue?: number;
    responseTimeUnit?: string;
  };
  measurementMonitoringMethod?: string;
  note?: string;
};

export type IOfferingCommitment = {
  commitmentConcerned?: string;
  triggerOperator?:
    | "<"
    | "<="
    | ">"
    | ">="
    | "="
    | "Outside window"
    | "Not delivered";
  triggerValue?: string;
  consequenceType?:
    | "Service credit"
    | "Discount"
    | "Refund"
    | "Fee waiver"
    | "Suspension"
    | "Termination"
    | "Fixed compensation"
    | "Cure period then escalation";
  penaltyAmount?: number;
  penaltyBasis?:
    | "% of period fee"
    | "% of total value"
    | "Fixed amount"
    | "Credit days"
    | "Amount per incident";
  penaltyCap?:
    | "% of monthly fee"
    | "% of annual fee"
    | "% of total value"
    | "Fixed cap"
    | "No cap";
  measurementPeriod?:
    | "Per incident"
    | "Daily"
    | "Weekly"
    | "Monthly"
    | "Quarterly"
    | "Rolling 30 days"
    | "Rolling 90 days"
    | "Contract duration";
  claimProcedure?: "Automatic credit" | "Claim required" | "Via ticket";
  claimDeadlineDays?: number;
  note?: string;
};

export type IContractDuration = {
  value?: number;
  unit?: "months" | "years";
  renewalMode?:
    | "None (contract ends)"
    | "Automatic renewal"
    | "On mutual agreement";
  noticePeriodDays?: number;
};

export type ITerminationForConvenience = {
  allowed?: boolean;
  noticePeriodDays?: number;
};

export type ITerminationForCause = {
  breachThreshold?: number;
  noticePeriod?: "Immediate (no notice)" | "X days notice";
  noticePeriodDays?: number;
  regulatoryOrSecurityTermination?:
    | "Yes (immediate)"
    | "Yes (with X days notice)"
    | "No (case-by-case)";
  regulatoryNoticeDays?: number;
};

export type IPenaltiesTerminationLink = {
  cumulativePenaltyCapTermination?: boolean;
  suspensionBeforeTermination?: boolean;
  suspensionDurationDays?: number;
};

interface IServiceOfferingExtension {
  description: string;
  keywords: string[];
  archived: boolean;
  visible: boolean;
  serviceOfferingVC: string;
  compliantServiceOfferingVC?: string;

  /**
   * System ObjectIDs of the aggregated data resources to facilitate query
   */
  dataResources: string[];

  /**
   * System ObjectIDs of the aggregated software resources to facilitate query
   */
  softwareResources: string[];
  /**
   * Value amount of the pricing for this offering
   */
  pricing: number;

  /**
   * Pricing models based on the PTX registry
   */
  pricingModel: string[];

  /**
   * Pricing description based on the PTX registry
   */
  pricingDescription: string;

  businessModel?: string[];

  /**
   * Maximum consumption of the service
   */
  maximumConsumption: string;

  /**
   * Maximum performance of the service
   */
  maximumPerformance: string;

  /**
   * User friendly B2C description of the offering
   * Used only for PII
   */
  b2cDescription?: any[];

  /**
   * User friendly Purpose of the offering
   * Used only for PII and when the offering has at least 1 software resource
   */
  purpose?: string;

  /**
   * A boolean to inform if the service does not have any user to use in data processing
   */
  userInteraction: boolean;

  /**
   * Service Level Agreement details
   */
  sla?: ISLA;

  /**
   * Commitments and penalties linked to this offering
   */
  commitments?: IOfferingCommitment[];

  /**
   * Duration of the contract associated with this offering
   */
  contractDuration?: IContractDuration;

  /**
   * Termination for convenience clause
   */
  terminationForConvenience?: ITerminationForConvenience;

  /**
   * Termination for cause clause
   */
  terminationForCause?: ITerminationForCause;

  /**
   * Link between cumulated penalties and termination conditions
   */
  penaltiesTerminationLink?: IPenaltiesTerminationLink;

  /**
   * Free-form custom fields allowing each deployed instance to store
   * sector-specific data (e.g. legal, healthcare, finance) without
   * altering the base model.
   * These fields are carried over into the contract as-is.
   */
  customFields?: Record<string, unknown>;
}

/**
 * Gaia-x valid schema for a Service Offering
 * The Service Offering is defined by Gaia-x here: https://docs.gaia-x.eu/policy-rules-committee/trust-framework/latest/service/
 */
export interface IServiceOffering
  extends AllSchemas,
    IServiceOfferingExtension {
  /**
   * A human readable name of the component
   */
  name: string;

  /**
   * A resolvable link to the participant self-description providing the service
   */
  providedBy: string;

  /**
   * A resolvable link to the resources self-description related to the service
   * and that can exist independently of it.
   */
  aggregationOf: string[];

  /**
   * a resolvable link to the service offering self-description related to the service
   * and that can exist independently of it.
   */
  dependsOn: string[];

  /**
   * A list of policy expressed using a ODRL
   */
  policy: any[];

  /**
   * A resolvable link to the Terms and Conditions applying to that service.
   */
  termsAndConditions: string;

  /**
   * A list of data protection regime from the list available at https://docs.gaia-x.eu/policy-rules-committee/trust-framework/latest/service/
   */
  dataProtectionRegime: PersonalDataProtectionRegimes[];

  /**
   * List of methods to export data from your user’s account out of the service
   */
  dataAccountExport: {
    /**
     * The mean to request data retrieval
     */
    requestType:
      | "API"
      | "email"
      | "webform"
      | "unregisteredLetter"
      | "registeredLetter"
      | "supportCenter";

    /**
     * Type of data support
     */
    accessType: "digital" | "physical";

    /**
     * type of Media Types (formerly known as MIME types) as defined by the IANA.
     * https://www.iana.org/assignments/media-types/media-types.xhtml
     */
    formatType: string;
  }[];

  /**
   * ISO-3166-1-alpha-2 code for the location of the service offering
   * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
   */
  location: string;

  /**
   * currency of the pricing
   */
  currency: string;

  /**
   * period of the billing
   */
  billingPeriod: string;

  /**
   * Setup fee for the service offering
   * @default 0
   */
  setupFee: number;

  /**
   * Cost per API call
   * @default 0
   */
  costPerAPICall: number;

  /**
   * List of categories applicable to the service offering
   *
   * This is a string reference to the PTX registry as it can
   * point to both data and service categories.
   *
   * It can be either a uri or a string
   */
  category: string[];
}

export interface IServiceOfferingMethods {}

export interface IServiceOfferingModel
  extends Model<IServiceOffering, object, IServiceOfferingMethods> {}
