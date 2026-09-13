import { Router } from 'express';
import * as controller from '../controllers/applicationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as rules from '../validators/index.js';
const router = Router();
router.use(authenticate);
router.get(
  '/my',
  authorize('student'),
  rules.applicationQuery,
  validate,
  controller.getApplications,
);
router.get(
  '/provider',
  authorize('provider'),
  rules.applicationQuery,
  validate,
  controller.getApplications,
);
router.get('/:id', rules.id('id'), validate, controller.detail);
router.post(
  '/:jobId',
  authorize('student'),
  rules.application,
  validate,
  controller.apply,
);
router.patch(
  '/:id/withdraw',
  authorize('student'),
  rules.id('id'),
  validate,
  controller.withdraw,
);
router.patch(
  '/:id/notes',
  authorize('student'),
  rules.notes('personalNotes'),
  validate,
  controller.updateNotes,
);
router.patch(
  '/:id/status',
  authorize('provider'),
  rules.statusUpdate,
  validate,
  controller.updateStatus,
);
router.patch(
  '/:id/provider-notes',
  authorize('provider'),
  rules.notes('providerNotes'),
  validate,
  controller.updateNotes,
);
export default router;
