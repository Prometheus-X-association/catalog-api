import { Router } from "express";
import { verifyJwtMiddleware } from "../../../middleware/auth";
import {
  checkDataSpaceConnector,
  generateAPIKey,
  getAPIKey,
  postDataSpaceConnector,
} from "../../../controllers/private/v1/participants.private.controller";

const router: Router = Router();

router.use(verifyJwtMiddleware);

router.post("/", postDataSpaceConnector);
router.post("/check", checkDataSpaceConnector);
router.post("/generate-api-key", generateAPIKey);
router.get("/api-key", getAPIKey);

export default router;
