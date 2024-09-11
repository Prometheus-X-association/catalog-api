import { Model } from "mongoose";
import { AllSchemas } from "./models";

export type EcosystemParticipantParticipation = {
  /**
   * ID of the ecosystem
   */
  ecosystem: string;

  /**
   * Offerings made available to the ecosystem
   */
  offerings: {
    /**
     * A Service offering Self-Description URL
     */
    serviceOffering: string;

    /**
     * Specific policies that apply to the ecosystem
     */
    policy: [];
  }[];
};

export interface LegalPerson {
  /**
   * Country's registration number, which identifies one specific entity
   * Can be local / EUID / EORI / vatID / leiCode
   */
  registrationNumber: string;

  headquartersAddress: {
    /**
     * Physical location of the headquarters in ISO 3166-2 alpha2, alpha-3 or numeric format.
     */
    countryCode: string;
  };

  legalAddress: {
    /**
     * Physical location of the headquarters in ISO 3166-2 alpha2, alpha-3 or numeric format.
     */
    countryCode: string;
  };

  /**
   * A list of direct participant that this entity is a subOrganization of, if any.
   */
  parentOrganization: string[];

  /**
   * A list of direct participant with a legal mandate on this entity, e.g., as a subsidiary.
   */
  subOrganization: string[];
}

export type ServiceUrls = {
  /**
   * The URL of the service used to export data
   */
  dataExport?: string;

  /**
   * The URL to send signed consent to exporting service
   */
  consentImport?: string;

  /**
   * url used by importing service
   */
  dataImport?: string;

  /**
   * The URL of the service used to authenticate a new user
   */
  consentExport?: string;
};

/**
 * A GAIA-X valid participant Schema
 * Gaia-x participant class : https://docs.gaia-x.eu/policy-rules-committee/trust-framework/latest/participant/
 */
export interface IParticipant extends AllSchemas {
  /**
   * DID identifier
   */
  did: string | null;

  /**
   * Legal name of the participant
   */
  legalName: string;

  /**
   * Legal information about the organisation / person
   */
  legalPerson: LegalPerson;

  /**
     * VC of a SHA512 of the Generic Terms and Conditions for Gaia-X Ecosystem signed by the issuer
     * The T&C are :
     * The PARTICIPANT signing the Self-Description agrees as follows:
        - to update its descriptions about any changes, be it technical, organizational, or legal 
        - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.

        The keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD).
     */
  termsAndConditions?: string;

  /**
   * Ecosystems the participant is a member of including what offerings
   * it brings to the ecosystem as well as specific policies on these
   * offerings (if any) for the ecosystem usage
   */
  ecosystems: EcosystemParticipantParticipation[];

  /**
   * credentials clientId
   */
  serviceKey: string;

  /**
   * credentials clientSecret
   */
  serviceSecretKey: string;

  /**
   * Identified a dataspace connector used by the participant
   */
  dataspaceConnectorAppKey: string;

  /**
   * dataspace connector default endpoint
   */
  dataspaceEndpoint: string;

  /**
   * useful Urls
   */
  urls?: ServiceUrls;
}

export interface IParticipantMethods {}

export interface IParticipantModel
  extends Model<IParticipant, object, IParticipantMethods> {}
