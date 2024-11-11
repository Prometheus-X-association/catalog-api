import { Schema } from "mongoose";
import {
  IServiceOffering,
  IServiceOfferingModel,
  IServiceOfferingMethods,
} from "../../types/serviceoffering";

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
    dataResources: [{ type: String, ref: "DataResource" }],
    softwareResources: [{ type: String, ref: "SoftwareResource" }],

    // Gaia-x federation
    compliantServiceOfferingVC: { type: String, default: "" },
    serviceOfferingVC: { type: String, default: "" },

    schema_version: { type: String, default: "1" },
  },
  {
    timestamps: true,
    query: {},
  }
);
