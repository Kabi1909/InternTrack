import { Router } from 'express';
import * as controller from '../controllers/interviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as rules from '../validators/index.js';
const router = Router();
router.use(authenticate);
router.get('/my', authorize('student'), rules.paging, validate, controller.getInterviews);
router.get(
  '/provider',
  authorize('provider'),
  rules.paging,
  validate,
  controller.getInterviews,
);
router.use(authorize('provider'));
router.post('/', rules.interview, validate, controller.create);
router.put('/:id', rules.id('id'), rules.interview, validate, controller.update);
router.patch('/:id/cancel', rules.id('id'), validate, controller.cancel);
export default router;
