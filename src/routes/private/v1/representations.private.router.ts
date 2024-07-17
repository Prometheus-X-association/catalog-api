import { Router } from 'express';
import { body, check } from 'express-validator';
import { verifyJwtMiddleware } from "../../../middleware/auth";
import {
  validate,
} from "../../../middleware/validator";
import {
  createRepresentation,
  deleteRepresentation,
  getRepresentationById,
  updateRepresentation
} from "../../../controllers/private/v1/representations.private.controller";

const router: Router = Router();

router.use(verifyJwtMiddleware);

router.get(
    '/:id',
    [check('id').isString()],
    validate,
    getRepresentationById
);

router.post(
    '/',
    [
        body('resourceID').exists().isString(),
        body('url').optional(),
        body('credential').optional().isString(),
    ],
    validate,
    createRepresentation
);

router.put(
    '/:id',
    [
        check('id').isString(),
        body('url').optional(),
        body('credential').optional().isString(),
    ],
    validate,
    updateRepresentation
);

router.delete(
    '/:id',
    [check('id').isString()],
    validate,
    deleteRepresentation
);

export default router;
