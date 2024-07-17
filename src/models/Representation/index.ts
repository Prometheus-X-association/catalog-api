import mongoose from "mongoose";

import { IRepresentation, IRepresentationModel } from "../../types/representation";
import { representationSchema } from "./Representation.model";

export const Representation = mongoose.model<
  IRepresentation,
  IRepresentationModel
>("Representation", representationSchema);
