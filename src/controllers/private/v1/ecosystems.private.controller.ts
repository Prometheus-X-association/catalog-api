import { Request, Response, NextFunction } from "express";
import { HydratedDocument, Types } from "mongoose";
import { Ecosystem, ServiceOffering } from "../../../models";
import { ECOSYSTEM_POPULATION } from "../../public/v1/ecosystems.public.controller";
import {
  batchInjectRoleAndObligations,
  generateEcosystemContract,
  getContractById,
  signContract,
} from "../../../libs/contract";
import { getDocumentId } from "../../../utils/mongooseDocumentHelpers";
import {
  IEcosystemInvitation,
  IEcosystemJoinRequest,
} from "../../../types/ecosystem";
import {
  ServiceOfferingPopulationType,
  serviceOfferingPopulation,
} from "../../../utils/schemaPopulation";

/**
 * Returns all ecosystems the authenticated organization is either
 * and admin of or a participant of
 */
export const getMyEcosystems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ecosystems = await Ecosystem.find({
      $or: [
        { orchestrator: req.user.id },
        {
          "participants.participant": req.user.id,
        },
        {
          "joinRequests.participant": req.user.id,
          "joinRequests.status": { $ne: "Rejected" },
        },
        {
          "invitations.participant": req.user.id,
          "invitations.status": { $ne: "Rejected" },
        },
      ],
    }).populate(ECOSYSTEM_POPULATION);

    return res.json(ecosystems);
  } catch (err) {
    next(err);
  }
};

/**
 * Creates an ecosystem
 */
export const createEcosystem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      logo,
      provides,
      searchedData,
      searchedServices,
      useCases,
      country_or_region,
      main_functionalities_needed,
      target_audience,
    } = req.body;

    const ecosystem = await Ecosystem.create({
      name,
      description,
      orchestrator: req.user.id,
      target_audience: target_audience || "",
      country_or_region: country_or_region || "",
      main_functionalities_needed: main_functionalities_needed || [],
      logo: logo || "ecosystem_default.jpg",
      administrator: req.user.id,
      searchedData: searchedData || [],
      searchedServices: searchedServices || [],
      useCases: useCases || [],
      provides,
      participants: [
        {
          roles: ["Orchestrator"],
          participant: req.user.id,
        },
      ],
    });

    try {
      const contract = await generateEcosystemContract({
        ecosystem: ecosystem.id,
        orchestrator: req.user.id,
      });
      ecosystem.contract = contract?._id || null;
      await ecosystem.save();
    } catch (err) {
      return res.status(424).json({
        code: 424,
        errorMsg: "third party api failure",
        message: "Failed to generate ecosystem contract",
        data: {
          status: err?.status,
          message: err?.message,
        },
      });
    }

    res.status(201).json(ecosystem);
  } catch (err) {
    next(err);
  }
};

/**
 * Updates an existing ecosystem by ID
 */
export const updateEcosystemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allowedKeys = [
      "name",
      "description",
      "location",
      "country_or_region",
      "target_audience",
      "main_functionalities_needed",
      "logo",
      "useCases",
      "searchedServices",
      "searchedData",
      "provides",
      "businessLogic",
      "contract",
      "rolesAndObligations",
      "buildingBlocks",
    ];

    const { rolesAndObligations, participantRoles } = req.body;

    if (rolesAndObligations || participantRoles) {
      const ecosystem = await Ecosystem.findById(req.params.id);
      if (!ecosystem) {
        return res.status(404).json({ message: "Ecosystem not found" });
      }

      // Modify roles in invitations & join requests
      if (participantRoles && participantRoles.length) {
        participantRoles.forEach(
          (p: { participantId: string; roles: string[] }) => {
            ecosystem.invitations = (ecosystem as any).invitations.map(
              (inv) => {
                if (getDocumentId(inv.participant) === p.participantId)
                  return inv;
                return { ...inv, roles: p.roles };
              }
            );

            ecosystem.joinRequests = (ecosystem as any).joinRequests.map(
              (inv) => {
                if (getDocumentId(inv.participant) === p.participantId)
                  return inv;
                return { ...inv, roles: p.roles };
              }
            );
          }
        );
      }
      // Inject rules in contract
      if (rolesAndObligations && rolesAndObligations.length) {
        try {
          await batchInjectRoleAndObligations({
            contractId: ecosystem.contract,
            rolesAndObligations: rolesAndObligations,
          });
        } catch (err) {
          return res
            .status(424)
            .json({ error: "Failed to update responsibilities in contract" });
        }
      }

      await ecosystem.save();
    }

    const updateFields = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedKeys.includes(key))
    );

    const ecosystem = await Ecosystem.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
      .populate(ECOSYSTEM_POPULATION)
      .lean();

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    return res.json(ecosystem);
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes an existing ecosystem by ID
 */
export const deleteEcosystemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ecosystem = await Ecosystem.findById(req.params.id);
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    await Ecosystem.findByIdAndDelete(ecosystem.id);
    res.status(200).json({ message: "Ecosystem deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a join request for an ecosystem
 * @author Felix Bole
 */
export const createJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: ecosystemId } = req.params;
    const { roles } = req.body;
    const participantId = req.user.id || "";

    // Check if the service is already a participant in the ecosystem
    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    }).populate<{
      invitations: HydratedDocument<IEcosystemInvitation>[];
    }>(["invitations"]);

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const isParticipant = ecosystem.participants.some(
      (participant) => participant.participant === participantId
    );

    if (isParticipant) {
      return res.status(400).json({
        req,
        res,
        code: 400,
        errorMsg: "existing participant",
        message: "Service is already a participant in this ecosystem",
      });
    }

    const existingInvitation = ecosystem.invitations.find(
      (i) => i.participant === participantId && i.status === "Pending"
    );

    if (existingInvitation) {
      const result = await ecosystem.acceptInvitation({
        participant: participantId,
        offerings: [], // Configured in the next phase
      });

      return res.json(result);
    }

    const result = await ecosystem.requestToJoin({
      participant: participantId,
      roles,
      offerings: [], // Configured in the next phase
    });

    if (!result.success) {
      return res.status(400).json({
        code: 400,
        errorMsg: "ecosystem join request failed",
        message: "The request to join the ecosystem failed",
        data: {
          joinRequest: result.joinRequest,
          errors: result.errors,
        },
      });
    }

    return res.status(201).json(result.joinRequest);
  } catch (err) {
    next(err);
  }
};

/**
 * Lambda organization querying for all received invitations
 */
export const getAllInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invitations = await Ecosystem.find({
      "invitations.participant": { $in: req.user.id },
    });

    return res.json(invitations);
  } catch (err) {
    next(err);
  }
};

/**
 * Orchestrator of an ecosystem querying for all pending invitations
 */
export const getInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: ecosystemId } = req.params;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    }).populate([
      {
        path: "invitations",
        populate: [
          {
            path: "participant",
          },
        ],
      },
    ]);

    if (!ecosystem) {
      return res.status(404).json({
        code: 404,
        errorMsg: "resource not found",
        message: "Ecosystem not found",
      });
    }

    const pending = ecosystem.invitations.filter(
      (inv) => inv.status === "Pending"
    );

    return res.json(pending);
  } catch (err) {
    next(err);
  }
};

/**
 * Orchestrator of an ecosystem inviting an organization to join
 */
export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: ecosystemId } = req.params;
    const { organizationID, roles, participantId } = req.body;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    });

    if (!ecosystem) {
      return res.status(404).json({
        req,
        res,
        code: 404,
        errorMsg: "resource not found",
        message: "Ecosystem not found",
      });
    }

    const existingJoinRequest = ecosystem.joinRequests.find(
      (el) =>
        getDocumentId(el.participant) === req.user.id && el.status === "Pending"
    );

    if (existingJoinRequest) {
      const result = await ecosystem.acceptJoinRequest({
        joinRequestID: existingJoinRequest._id,
        overrideRoles: roles,
      });

      return res.json(result);
    }

    const result = await ecosystem.invite({
      participant: participantId,
      roles,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Organization accepting to join an ecosystem on invite
 */
export const acceptInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: ecosystemId } = req.params;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    });

    if (!ecosystem) {
      return res.status(404).json({
        code: 404,
        errorMsg: "resource not found",
        message: "Ecosystem not found",
      });
    }

    try {
      const result = await ecosystem.acceptInvitation({
        participant: req.user.id,
        offerings: [], // Configured in the next phase of the process
      });

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        code: 400,
        errorMsg: "ecosystem invitation accept error",
        message: "An error occured when trying to accept the invitation",
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Organization denying to join an ecosystem on invite
 */
export const denyInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: ecosystemId } = req.params;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    });

    if (!ecosystem) {
      return res.status(404).json({
        req,
        res,
        code: 404,
        errorMsg: "resource not found",
        message: "Ecosystem not found",
      });
    }
    const result = await ecosystem.cancelInvitation({
      participant: req.user.id,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Gets all join requests for an ecosystem
 * @author Felix Bole
 */
export const getJoinRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: ecosystemId } = req.params;
    const { filter } = req.query;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    });

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    let result = [];
    if (["Pending", "Authorized", "Rejected"].includes(filter?.toString())) {
      result = ecosystem.joinRequests.filter((jr) => jr.status === filter);
    } else {
      result = ecosystem.joinRequests;
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Authorizes a join request for an ecosystem
 */
export const authorizeJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ecosystemId = req.params.id;
    const requestId = req.params.requestId;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    });
    if (!ecosystem) {
      return res
        .status(404)
        .json({ message: "Ecosystem not found or unauthorized" });
    }

    const result = await ecosystem.acceptJoinRequest({
      joinRequestID: requestId,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Rejects a join request from an org for an ecosystem
 * @author Felix Bole
 */
export const rejectJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ecosystemId = req.params.id;
    const requestId = req.params.requestId;

    const ecosystem = await Ecosystem.findOne({
      _id: ecosystemId,
    });
    if (!ecosystem) {
      return res
        .status(404)
        .json({ message: "Ecosystem not found or unauthorized" });
    }

    const result = await ecosystem.rejectJoinRequest(requestId);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Allows for an ecosystem contract generation post creation of an ecosystem
 * Useful for ecosystem contract generation dependancy client error happens when
 * creating the ecosystem in the first place
 * @author Felix Bole
 */
export const createEcosystemContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ecosystem = await Ecosystem.findById(id);

    if (!ecosystem)
      return res.status(404).json({
        code: 404,
        errorMsg: "Not found",
        message: "Ecosystem not found",
      });

    let contract = null;

    try {
      contract = await generateEcosystemContract({
        ecosystem: id,
        orchestrator: req.user.id,
      });
      ecosystem.contract = contract?._id || null;
      await ecosystem.save();
    } catch (err) {
      return res.status(424).json({
        code: 424,
        message: "Failed to generate ecosystem contract",
        data: { status: err?.status, message: err?.message },
      });
    }

    return res.json(contract);
  } catch (err) {
    next(err);
  }
};

/**
 * Returns the ecosystems contract
 * @author Felix Bole
 */
export const getEcosystemContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ecosystem = await Ecosystem.findById(id);
    if (!ecosystem)
      return res.status(404).json({
        code: 404,
        errorMsg: "Not found",
        message: "Ecosystem not found",
      });
    try {
      const contract = await getContractById(ecosystem.contract, "ecosystem");
      return res.json(contract);
    } catch (err) {
      return res.status(404).json({
        code: 404,
        message: "Contract not found",
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Enables a participant or orchestrator to sign the contract
 * @author Felix Bole
 */
export const applyOrchestratorSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;
    const ecosystem = await Ecosystem.findById(id);

    if (!ecosystem)
      return res.status(404).json({
        code: 404,
        errorMsg: "Not found",
        message: "Ecosystem not found",
      });

    if (!ecosystem.contract) {
      return res.status(400).json({
        code: 400,
        errorMsg: "Contract does not exist",
        message: "The ecosystem contract was not properly generated",
      });
    }

    try {
      const contract = await signContract({
        contractId: ecosystem.contract,
        participant: req.user.id,
        signature: signature,
        role: "orchestrator", // As defined by Contract BB
      });

      return res.json({
        code: 200,
        message: "successfully signed contract",
        data: contract,
      });
    } catch (err) {
      return res.status(424).json({
        code: 424,
        errorMsg: "third party api failure",
        message: "Failed to sign ecosystem contract",
        data: { status: err?.status, message: err?.message },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Enables a participant to sign the contract
 * @author Felix Bole
 */
export const applyParticipantSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;
    const ecosystem = await Ecosystem.findById(id);

    if (!ecosystem)
      return res.status(404).json({
        code: 404,
        errorMsg: "Not found",
        message: "Ecosystem not found",
      });

    if (!ecosystem.contract) {
      return res.status(400).json({
        req,
        res,
        code: 400,
        errorMsg: "Contract does not exist",
        message: "The ecosystem contract was not properly generated",
      });
    }

    const predicate = (obj: IEcosystemInvitation | IEcosystemJoinRequest) =>
      obj.participant === req.user.id && obj.status === "Authorized";

    const inInvite = ecosystem.invitations.find(predicate);
    const inJoinReq = ecosystem.joinRequests.find(predicate);

    if (!inInvite && !inJoinReq) {
      if (!ecosystem.contract) {
        return res.status(400).json({
          code: 400,
          errorMsg: "unauthorized participant in ecosystem",
          message:
            "The participant does not have an authorized join request or invitation",
        });
      }
    }

    try {
      const contract = await signContract({
        contractId: ecosystem.contract,
        participant: req.user.id,
        signature: signature,
        role: "participant",
      });

      if (inJoinReq) inJoinReq.status = "Signed";
      if (inInvite) inInvite.status = "Signed";

      // Add participant to ecosystem now that he has signed
      // Also add roles and offerings
      const roles = inJoinReq ? inJoinReq.roles : inInvite.roles;
      const offerings = inJoinReq ? inJoinReq.offerings : inInvite.offerings;
      ecosystem.participants.push({
        participant: req.user.id,
        roles,
        offerings,
      });

      await ecosystem.save();

      return res.json({
        code: 200,
        message: "successfully signed contract",
        data: contract,
      });
    } catch (err) {
      return res.status(424).json({
        code: 424,
        errorMsg: "third party api failure",
        message: "Failed to sign ecosystem contract",
        data: { status: err?.status, message: err?.message },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Enables a participant to configure the offerings he makes
 * available to an ecosystem as well as the policies configured for it
 */
export const configureParticipantEcosystemOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ecosystem = await Ecosystem.findById(id);

    if (!ecosystem)
      return res.status(404).json({
        req,
        res,
        code: 404,
        errorMsg: "Not found",
        message: "Ecosystem not found",
      });

    const { offerings } = req.body;

    const joinRequest = ecosystem.joinRequests.find(
      (p) => p.participant === req.user.id
    );
    const invitation = ecosystem.invitations.find(
      (p) => p.participant === req.user.id
    );
    const participant = ecosystem.participants.find(
      (p) => p.participant === req.user.id
    );

    if (joinRequest) joinRequest.offerings = offerings;
    if (invitation) invitation.offerings = offerings;
    if (participant) participant.offerings = offerings;

    await ecosystem.save();

    return res.json(ecosystem);
  } catch (err) {
    next(err);
  }
};
