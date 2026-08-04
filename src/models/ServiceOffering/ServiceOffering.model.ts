import { Schema } from "mongoose";
import {
  IServiceOffering,
  IServiceOfferingModel,
  IServiceOfferingMethods,
} from "../../types/serviceoffering";

const ACCEPTANCE_CONDITIONS = [
  "fixed",
  "range",
  "min",
  "max",
  "enum",
  "any",
] as const;

const valueAcceptanceSchema = new Schema(
  {
    condition: {
      type: String,
      enum: ACCEPTANCE_CONDITIONS,
      required: true,
    },
    // Used by "fixed"
    value: { type: Schema.Types.Mixed },
    // Used by "range" and "min"
    min: { type: Schema.Types.Mixed },
    // Used by "range" and "max"
    max: { type: Schema.Types.Mixed },
    // Used by "enum"
    values: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
  },
  { _id: false }
);

// Cross-field validation: each condition requires its own fields
valueAcceptanceSchema.pre("validate", function (next) {
  const { condition, value, min, max, values } = this as any;

  switch (condition) {
    case "fixed":
      if (value === undefined || value === null) {
        this.invalidate("value", '"value" est requis pour condition="fixed"');
      }
      break;
    case "range":
      if (min === undefined || min === null) {
        this.invalidate("min", '"min" est requis pour condition="range"');
      }
      if (max === undefined || max === null) {
        this.invalidate("max", '"max" est requis pour condition="range"');
      }
      if (min != null && max != null && min > max) {
        this.invalidate("min", '"min" doit être <= "max"');
      }
      break;
    case "min":
      if (min === undefined || min === null) {
        this.invalidate("min", '"min" est requis pour condition="min"');
      }
      break;
    case "max":
      if (max === undefined || max === null) {
        this.invalidate("max", '"max" est requis pour condition="max"');
      }
      break;
    case "enum":
      if (!Array.isArray(values) || values.length === 0) {
        this.invalidate(
          "values",
          '"values" doit être un tableau non vide pour condition="enum"'
        );
      }
      break;
    case "any":
      // Nothing to validate
      break;
  }
  next();
});

const fieldPolicySchema = new Schema(
  {
    isNegotiable: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    valueAcceptance: {
      type: valueAcceptanceSchema,
      required: function (this: any) {
        return this.isNegotiable === true;
      },
    },
  },
  { _id: false }
);

// Consistency: valueAcceptance must not exist when isNegotiable is false
fieldPolicySchema.pre("validate", function (next) {
  const self = this as any;
  if (!self.isNegotiable && self.valueAcceptance) {
    this.invalidate(
      "valueAcceptance",
      "valueAcceptance ne doit pas être défini quand isNegotiable=false"
    );
  }
  next();
});

export const serviceOfferingSchema = new Schema<
  IServiceOffering,
  IServiceOfferingModel,
  IServiceOfferingMethods
>(
  {
    // Gaia-x
    name: { type: String, required: true },
    providedBy: { type: String },
    aggregationOf: [{ type: String }],
    dependsOn: [{ type: String }],
    policy: [{ type: Schema.Types.Mixed }],
    termsAndConditions: { type: String, default: "" },
    dataProtectionRegime: [{ type: String }],
    dataAccountExport: [
      {
        requestType: {
          type: String,
          enum: [
            "API",
            "email",
            "webform",
            "unregisteredLetter",
            "registeredLetter",
            "supportCenter",
          ],
        },
        accessType: {
          type: String,
          enum: ["digital", "physical"],
        },
        formatType: { type: String },
      },
    ],

    // Visions defined
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: [String],
    dataResources: [{ type: Schema.Types.ObjectId, ref: "DataResource" }],
    softwareResources: [
      { type: Schema.Types.ObjectId, ref: "SoftwareResource" },
    ],

    // Gaia-x federation
    compliantServiceOfferingVC: { type: String, default: "" },
    serviceOfferingVC: { type: String, default: "" },

    schema_version: { type: String, default: "1" },

    // Service Levels SLAs
    sla: new Schema(
      {
        deliveryDeadline: new Schema(
          {
            value: { type: Number },
            unit: {
              type: String,
              enum: ["hours", "business days", "calendar days"],
            },
          },
          { _id: false }
        ),
        availability: {
          type: String,
          enum: ["Best effort", "99%", "99.5%", "99.9%", "99.95%", "99.99%"],
        },
        updateFrequency: {
          type: String,
          enum: [
            "Real-time / streaming",
            "Hourly",
            "Daily",
            "Weekly",
            "Monthly",
            "Quarterly",
            "On request",
            "Static (no update)",
          ],
        },
        responseTime: new Schema(
          {
            value: { type: Number },
            unit: { type: String, enum: ["ms", "s"] },
            measurementBasis: {
              type: String,
              enum: ["Average", "p95", "p99"],
            },
          },
          { _id: false }
        ),
        availabilityTimeWindow: new Schema(
          {
            value: {
              type: String,
              enum: ["24/7", "Business hours 5x8", "Extended 5x12"],
            },
            timezone: { type: String },
          },
          { _id: false }
        ),
        retentionPeriod: { type: Number },
        availabilityPeriod: {
          type: String,
          enum: [
            'Session only',
            '30 days',
            '90 days',
            '1 year',
            'Contract duration',
            'Until consent withdrawal',
          ],
        },
        endOfSupportDate: {
          type: String,
          enum: [
            '10 days after contract ends',
            '30 days after contract ends',
            'Contract duration',
          ],
        },
        endOfLifeDate: {
          type: String,
          enum: [
            '10 days after contract ends',
            '30 days after contract ends',
            'Contract duration',
          ],
        },
        supportChannels: {
          type: [String],
          enum: [
            "Email",
            "Phone",
            "Chat",
            "Ticketing portal",
            "Slack",
            "Community forum",
            "Dedicated CSM",
          ],
          default: [],
        },
        supportServiceHours: {
          type: String,
          enum: ["24/7", "Business hours 5x8", "Extended 5x12"],
        },
        supportSeverityLevel: new Schema(
          {
            level: {
              type: String,
              enum: ["Critical", "High", "Medium", "Low"],
            },
            responseTimeValue: { type: Number },
            responseTimeUnit: { type: String },
          },
          { _id: false }
        ),
        measurementMonitoringMethod: { type: String },
        note: { type: String },
      },
      { _id: false }
    ),

    // Commitments and Penalties
    commitments: [
      new Schema(
        {
          commitmentConcerned: { type: String },
          triggerOperator: {
            type: String,
            enum: [
              "<",
              "<=",
              ">",
              ">=",
              "=",
              "Outside window",
              "Not delivered",
            ],
          },
          triggerValue: { type: String },
          consequenceType: {
            type: String,
            enum: [
              "Service credit",
              "Discount",
              "Refund",
              "Fee waiver",
              "Suspension",
              "Termination",
              "Fixed compensation",
              "Cure period then escalation",
            ],
          },
          penaltyAmount: { type: Number },
          penaltyBasis: {
            type: String,
            enum: [
              "% of period fee",
              "% of total value",
              "Fixed amount",
              "Credit days",
              "Amount per incident",
            ],
          },
          penaltyCap: {
            type: String,
            enum: [
              "% of monthly fee",
              "% of annual fee",
              "% of total value",
              "Fixed cap",
              "No cap",
            ],
          },
          measurementPeriod: {
            type: String,
            enum: [
              "Per incident",
              "Daily",
              "Weekly",
              "Monthly",
              "Quarterly",
              "Rolling 30 days",
              "Rolling 90 days",
              "Contract duration",
            ],
          },
          claimProcedure: {
            type: String,
            enum: ["Automatic credit", "Claim required", "Via ticket"],
          },
          claimDeadlineDays: { type: Number },
          note: { type: String },
        },
        { _id: false }
      ),
    ],

    // Contract Duration
    contractDuration: new Schema(
      {
        value: { type: Number },
        unit: { type: String, enum: ["months", "years"] },
        renewalMode: {
          type: String,
          enum: [
            "None (contract ends)",
            "Automatic renewal",
            "On mutual agreement",
          ],
        },
        noticePeriodDays: { type: Number },
      },
      { _id: false }
    ),

    // Termination for Convenience
    terminationForConvenience: new Schema(
      {
        allowed: { type: Boolean, default: false },
        noticePeriodDays: { type: Number },
      },
      { _id: false }
    ),

    // Termination for Cause
    terminationForCause: new Schema(
      {
        breachThreshold: { type: Number },
        noticePeriod: {
          type: String,
          enum: ["Immediate (no notice)", "X days notice"],
        },
        noticePeriodDays: { type: Number },
        regulatoryOrSecurityTermination: {
          type: String,
          enum: [
            "Yes (immediate)",
            "Yes (with X days notice)",
            "No (case-by-case)",
          ],
        },
        regulatoryNoticeDays: { type: Number },
      },
      { _id: false }
    ),

    // Penalties & Termination Link
    penaltiesTerminationLink: new Schema(
      {
        cumulativePenaltyCapTermination: {
          type: Boolean,
          default: false,
        },
        suspensionBeforeTermination: { type: Boolean, default: false },
        suspensionDurationDays: { type: Number },
      },
      { _id: false }
    ),

    // Free-form custom fields for sector-specific data (legal, healthcare, finance, etc.)
    // Carried over into the contract as-is.
    customFields: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    query: {},
  }
);
