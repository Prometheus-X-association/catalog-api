import { Schema, Types } from "mongoose";
import { IRepresentation, IRepresentationMethods, IRepresentationModel } from "../../types/representation";

export const representationSchema = new Schema<
    IRepresentation,
    IRepresentationModel,
    IRepresentationMethods
>(
    {
        // Representation
        resourceID: { type: String, required: true },
        url: { type: String, default: "" },
        credential: { type: String, default: "" },
    },
    {
        timestamps: true,
        query: {},
    }
);
