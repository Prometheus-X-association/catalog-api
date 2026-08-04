import { Schema } from "mongoose";
import {
  IEcosystem,
  IEcosystemModel,
  IEcosystemMethods,
} from "../../types/ecosystem";

// Sub-schemas for Project
const ProjectDataNeedSchema = new Schema(
  { resource: { type: String }, description: { type: String } },
  { _id: false }
);

const ProjectServiceNeedSchema = new Schema(
  { service: { type: String }, description: { type: String } },
  { _id: false }
);

const ProjectServiceInfrastructureSchema = new Schema(
  { infrastructure: { type: String }, description: { type: String } },
  { _id: false }
);

const ProjectContributionSchema = new Schema(
  { contribution: { type: String }, description: { type: String } },
  { _id: false }
);

const ProjectParticipantRoleSchema = new Schema(
  { participant: { type: String }, roles: { type: [String], default: [] } },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: { type: String },
    caption: { type: String },
    description: { type: String },
    categories: { type: [String], default: [] },
    countryOrRegion: { type: String },
    picture: { type: String },
    purpose: { type: String },
    benefit: { type: String },
    desiredDataAvailabilityDate: { type: Date },
    legalBasisOfProcessing: { type: String },
    legalBasisDescription: { type: String },
    dataNeed: { type: [ProjectDataNeedSchema], default: [] },
    serviceNeed: { type: [ProjectServiceNeedSchema], default: [] },
    serviceInfrastructures: {
      type: [ProjectServiceInfrastructureSchema],
      default: [],
    },
    criteriaAndConditions: { type: String },
    contributions: { type: [ProjectContributionSchema], default: [] },
    participantsAndRoles: { type: [ProjectParticipantRoleSchema], default: [] },
  },
  { _id: false }
);

// Sub-schemas for AdditionalClauses
const ReversibilityExitSchema = new Schema(
  {
    value: {
      type: String,
      enum: [
        "None",
        "Data deletion only",
        "Return + deletion",
        "Return + deletion + destruction certificate",
      ],
      default: "None",
    },
    deadlineDays: { type: Number, enum: [30, 60, 90] },
  },
  { _id: false }
);

const SubcontractingSchema = new Schema(
  { subcontractors: { type: [String], default: [] } },
  { _id: false }
);

const SecurityIncidentNotificationSchema = new Schema(
  {
    value: {
      type: String,
      enum: ["Without undue delay", "24h", "48h", "72h"],
      default: "Without undue delay",
    },
  },
  { _id: false }
);

const IntellectualPropertyOnOutputsSchema = new Schema(
  {
    value: {
      type: String,
      enum: [
        "Provider retains all",
        "Consumer owns results",
        "Joint ownership",
        "Licensed back",
        "No derivative rights",
      ],
      default: "Provider retains all",
    },
  },
  { _id: false }
);

const GoverningLawSchema = new Schema(
  {
    countryISO: { type: String },
    disputeMode: {
      type: String,
      enum: ["Courts", "Arbitration", "Mediation then arbitration"],
    },
  },
  { _id: false }
);

const ForceMajeureSchema = new Schema(
  {
    value: {
      type: String,
      enum: ["Standard clause", "Standard + epidemic", "None"],
      default: "Standard clause",
    },
  },
  { _id: false }
);

const AuditRightSchema = new Schema(
  {
    value: {
      type: String,
      enum: [
        "None",
        "Self-certification",
        "Audit on notice",
        "Third-party audit",
        "Regulator access",
      ],
      default: "None",
    },
    frequency: {
      type: String,
      enum: ["Annual", "On suspicion", "Once per contract"],
    },
  },
  { _id: false }
);

const ConfidentialitySchema = new Schema(
  {
    value: {
      type: String,
      enum: ["None", "Mutual NDA", "Unilateral NDA"],
      default: "None",
    },
    survivalYears: { type: Number, enum: [1, 3, 5] },
  },
  { _id: false }
);

const AmendmentModificationSchema = new Schema(
  {
    value: {
      type: String,
      enum: ["Written amendment only", "Mutual agreement", "With notice"],
      default: "Written amendment only",
    },
  },
  { _id: false }
);

const AdditionalClausesSchema = new Schema(
  {
    reversibilityExit: { type: ReversibilityExitSchema, default: null },
    subcontracting: { type: SubcontractingSchema, default: null },
    securityIncidentNotification: {
      type: SecurityIncidentNotificationSchema,
      default: null,
    },
    intellectualPropertyOnOutputs: {
      type: IntellectualPropertyOnOutputsSchema,
      default: null,
    },
    governingLawAndJurisdiction: { type: GoverningLawSchema, default: null },
    forceMajeure: { type: ForceMajeureSchema, default: null },
    auditRight: { type: AuditRightSchema, default: null },
    confidentiality: { type: ConfidentialitySchema, default: null },
    amendmentModification: { type: AmendmentModificationSchema, default: null },
  },
  { _id: false }
);

export const ecosystemSchema = new Schema<
  IEcosystem,
  IEcosystemModel,
  IEcosystemMethods
>(
  {
    orchestrator: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    country_or_region: { type: String, default: "" },
    target_audience: { type: String, default: "" },
    main_functionalities_needed: [{ type: String }],
    logo: {
      type: String,
      required: false,
      default: "default_ecosystem.jpg",
    },
    useCases: [{ type: Schema.Types.Mixed }],
    joinRequests: [
      {
        participant: { type: String },
        roles: [String],
        valueProposition: { type: String, required: false },
        status: {
          type: String,
          enum: ["Pending", "Authorized", "Rejected", "Signed"],
          default: "Pending",
          required: true,
        },
        createdAt: { type: Date, default: new Date(), required: true },
        updatedAt: { type: Date, default: new Date(), required: true },
      },
    ],
    invitations: [
      {
        participant: { type: String },
        roles: [String],
        valueProposition: { type: String, required: false },
        status: {
          type: String,
          enum: ["Pending", "Authorized", "Rejected", "Signed"],
          default: "Pending",
          required: true,
        },
        createdAt: { type: Date, default: new Date(), required: true },
        updatedAt: { type: Date, default: new Date(), required: true },
      },
    ],
    infrastructureServices: [
      {
        infrastructureService: { type: String, required: false },
        participant: { type: String, required: false },
        status: {
          type: String,
          enum: ["Pending", "Signed"],
          default: "Pending",
          required: false,
        },
      },
    ],
    dataProcessingChains: [
      {
        infrastructureServices: [
          {
            participant: { type: String, required: true },
            serviceOffering: { type: String, required: true },
            params: { type: String },
            configuration: { type: String },
          },
        ],
      },
    ],
    participants: [
      {
        participant: { type: String },
        roles: [String],
        offerings: [
          {
            serviceOffering: { type: String },
            policy: [
              {
                ruleId: { type: String, required: true },
                values: {
                  type: Schema.Types.Mixed,
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],
    searchedData: [{ type: String }],
    searchedServices: [{ type: String }],
    provides: [{ type: String }],
    contract: { type: String, default: null },
    location: { type: String, default: "" },
    businessLogic: {
      businessModel: [{ type: String }],
      roles: [
        {
          businessModels: [{ type: String }],
          benefits: [{ type: String }],
          costs: [{ type: String }],
          payingParties: [{ type: String }],
          role: { type: String },
        },
      ],
    },
    rolesAndObligations: [
      {
        role: { type: String },
        ruleId: { type: String },
        values: Schema.Types.Mixed,
      },
    ],
    buildingBlocks: [
      {
        buildingBlock: { type: String },
        implementation: { type: String },
      },
    ],
    // Project
    project: { type: ProjectSchema, default: null },

    // Additional Clauses
    additionalClauses: { type: AdditionalClausesSchema, default: null },

    // Free-form custom fields for sector-specific data (legal, healthcare, finance, etc.)
    // Carried over into the contract as-is.
    customFields: { type: Schema.Types.Mixed, default: null },

    schema_version: { type: String, default: "1.1.0" },
  },
  {
    timestamps: true,
    query: {},
  }
);
