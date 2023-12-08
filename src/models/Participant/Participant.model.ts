import { Schema } from "mongoose";
import {
  IParticipant,
  IParticipantModel,
  IParticipantMethods,
} from "../../types/participant";

export const participantSchema = new Schema<
  IParticipant,
  IParticipantModel,
  IParticipantMethods
>(
  {
    did: { type: String, default: null },
    legalName: { type: String, required: true },
    legalPerson: {
      registrationNumber: { type: String, default: "" },
      headquartersAddress: {
        countryCode: { type: String, default: "" },
      },
      legalAddress: {
        countryCode: { type: String, default: "" },
      },
      parentOrganization: [{ type: String }],
      subOrganization: [{ type: String }],
    },
    termsAndConditions: { type: String, default: "" },
    schema_version: { type: String, default: "1" },
  },
  {
    timestamps: true,
    query: {},
  }
);
