import { Schema } from "mongoose";
import {
  IDataResource,
  IDataResourceModel,
  IDataResourceMethods,
} from "../../types/dataresource";

export const dataResourceSchema = new Schema<
  IDataResource,
  IDataResourceModel,
  IDataResourceMethods
>(
  {
    // Resource
    aggregationOf: [String],
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Virtual Resource
    copyrightOwnedBy: [{ type: String }],
    license: [{ type: String }],
    policy: [{ type: Schema.Types.Mixed }],

    // Data Resource
    producedBy: { type: String, required: true },
    exposedThrough: [{ type: String }],
    obsoleteDateTime: { type: String, default: "" },
    expirationDateTime: { type: String, default: "" },
    containsPII: { type: Boolean, required: true },
    category: { type: String, default: "" },
    representation: { type: String, ref: "Representation" },

    schema_version: { type: String, default: "1" },
  },
  {
    timestamps: true,
    query: {},
  }
);
