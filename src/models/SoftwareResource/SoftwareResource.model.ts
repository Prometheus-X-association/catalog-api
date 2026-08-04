import { Schema, Types } from "mongoose";
import {
  ISoftwareResource,
  ISoftwareResourceModel,
  ISoftwareResourceMethods,
} from "../../types/softwareresource";

export const softwareResourceSchema = new Schema<
  ISoftwareResource,
  ISoftwareResourceModel,
  ISoftwareResourceMethods
>(
  {
    providedBy: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    aggregationOf: [{ type: String }],
    copyrightOwnedBy: [{ type: String }],
    license: [{ type: String }],
    policy: [{ type: Schema.Types.Mixed }],
    category: { type: String },
    locationAddress: [{ countryCode: { type: String } }],
    users_clients: { type: Number },
    demo_link: { type: String },
    relevant_project_link: { type: String },
    representation: { type: String, ref: "Representation" },
    isAPI: { type: Boolean, default: false },
    usePII: { type: Boolean, default: false },
    schema_version: { type: String, default: "1.1.0" },
    piiInformation: {
      dataUserRole: {
        type: String,
        enum: ["dataController", "dataProcessor", "jointDataController"],
      },
      processingPurposes: [{ type: String }],
      legalBasis: { type: String },
      usageRestrictions: [{ type: String }],
      dpoContact: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
      },
      plannedProcessingActivities: [{ type: String }],
      dataCategories: [{ type: String }],
      dataSubjectCategories: [{ type: String }],
      dataVolumeRange: {
        type: String,
        enum: [
          "1-100",
          "100-1000",
          "1000-10000",
          "10000-100000",
          "100000-1000000",
          "1000000+",
        ],
      },
      subProcessorsInvolved: [{ type: Schema.Types.Mixed }],
      transferOutsideEEA: {
        hasTransfer: { type: Boolean },
        countries: [{ type: String }],
        activities: [{ type: String }],
        safeguards: [{ type: String }],
      },
      subsequentSubProcessingNoticePeriod: { type: Number },
      dataSubjectRightsAssistanceDelay: { type: Number },
      securityBreachAssistanceDelay: {
        type: String,
        enum: ["reasonableDelay", "72h"],
      },
      auditNoticePeriod: { type: Number },
      subsequentControllerReuseAuthorization: {
        authorized: { type: Boolean },
        details: { type: String },
      },
      securityMeasures: { type: Schema.Types.Mixed },
      securityCertificationStandard: [
        {
          type: String,
          enum: [
            "ISO27001",
            "ISO27701",
            "ISO9001",
            "Europrivacy",
            "SOC2",
            "SECNUMCLOUD",
          ],
        },
      ],
      securityCertificationDate: { type: Date },
      securityCertificationExpiryDate: { type: Date },
    },
  },
  {
    timestamps: true,
    query: {},
  }
);
