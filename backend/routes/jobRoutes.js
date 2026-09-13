import { Router } from 'express';
import * as controller from '../controllers/jobController.js';
import { getApplications } from '../controllers/applicationController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as rules from '../validators/index.js';
const router = Router();
router.get('/', optionalAuth, rules.jobQuery, validate, controller.browse);
router.get(
  '/:jobId/applications',
  authenticate,
  authorize('provider'),
  rules.id('jobId'),
  rules.applicationQuery,
  validate,
  getApplications,
);
router.get('/:id', optionalAuth, rules.id('id'), validate, controller.detail);
router.use(authenticate, authorize('provider'));
router.post('/', rules.job, validate, controller.create);
router.put('/:id', rules.id('id'), rules.job, validate, controller.update);
router.patch('/:id/close', rules.id('id'), validate, controller.close);
router.delete('/:id', rules.id('id'), validate, controller.remove);
export default router;
