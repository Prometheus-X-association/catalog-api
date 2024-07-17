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
    schema_version: { type: String, default: "1.1.0" },
  },
  {
    timestamps: true,
    query: {},
  }
);
