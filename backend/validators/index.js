import { body, param, query } from 'express-validator';
import {
  roles,
  jobTypes,
  workModes,
  jobStatuses,
  applicationStatuses,
  providerStatuses,
  interviewTypes,
  interviewStatuses,
} from '../utils/constants.js';
export const id = (name) => param(name).isMongoId().withMessage('Invalid resource ID.');
const text = (name, max = 3000) =>
  body(name).optional().isString().bail().trim().isLength({ max });
const url = (name) =>
  body(name)
    .optional({ values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Use a valid http(s) URL.');
const tags = (name) => [
  body(name).optional().isArray({ max: 40 }),
  body(`${name}.*`).optional().isString().bail().trim().isLength({ min: 1, max: 100 }),
];
export const paging = [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
export const register = [
  body('name').isString().bail().trim().isLength({ min: 2, max: 100 }),
  body('email')
    .isString()
    .bail()
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
    })
    .toLowerCase(),
  body('password')
    .isString()
    .bail()
    .isLength({ min: 8 })
    .custom((value) => Buffer.byteLength(value) <= 72)
    .withMessage('Use a password between 8 characters and 72 bytes.'),
  body('role').isIn(roles),
  text('university', 200),
  text('degree', 200),
  text('companyName', 200),
  text('industry', 200),
];
export const login = [
  body('email').isString().bail().isEmail().trim().toLowerCase(),
  body('password').isString().bail().notEmpty().isLength({ max: 200 }),
];
export const studentProfile = [
  text('phone', 30),
  text('university', 200),
  text('degree', 200),
  body('graduationYear').optional({ values: 'falsy' }).isInt({ min: 1950, max: 2100 }),
  ...tags('skills'),
  ...tags('preferredJobRoles'),
  text('preferredWorkLocation', 200),
  url('linkedinUrl'),
  url('githubUrl'),
  text('bio', 3000),
];
export const providerProfile = [
  text('companyName', 200),
  text('companyDescription', 10000),
  url('website'),
  text('industry', 150),
  text('location', 200),
  body('contactEmail').optional({ values: 'falsy' }).isEmail().trim().toLowerCase(),
];
export const userProfile = [
  body('name').optional().isString().bail().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isString().bail().isEmail().trim().toLowerCase(),
];
export const job = [
  body('title').isString().bail().trim().isLength({ min: 3, max: 200 }),
  body('description').isString().bail().trim().isLength({ min: 20, max: 15000 }),
  body('jobType').isIn(jobTypes),
  body('workMode').isIn(workModes),
  body('location').isString().bail().trim().isLength({ min: 2, max: 200 }),
  body('category').isString().bail().trim().isLength({ min: 2, max: 100 }),
  body('applicationDeadline')
    .isISO8601()
    .bail()
    .custom(
      (value) =>
        new Date(value.length === 10 ? value + 'T23:59:59.999Z' : value) > new Date(),
    )
    .withMessage('Deadline must be in the future.'),
  body('numberOfPositions').isInt({ min: 1, max: 10000 }),
  body('status')
    .optional()
    .isIn(jobStatuses.filter((status) => status !== 'Expired')),
  body('salaryMin').optional({ values: 'null' }).isFloat({ min: 0 }),
  body('salaryMax')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .custom(
      (value, { req }) =>
        req.body.salaryMin == null || Number(value) >= Number(req.body.salaryMin),
    )
    .withMessage('Maximum salary must be at least minimum salary.'),
  text('salaryText', 200),
  text('responsibilities', 15000),
  text('qualifications', 15000),
  text('experienceRequirements', 500),
  ...tags('requiredSkills'),
];
export const jobQuery = [
  ...paging,
  ...['search', 'location', 'skills', 'category', 'experienceRequirements'].map((name) =>
    query(name).optional().isString().bail().isLength({ max: 200 }),
  ),
  query('jobType').optional().isIn(jobTypes),
  query('workMode').optional().isIn(workModes),
  query('status').optional().isIn(jobStatuses),
  query('sort').optional().isIn(['latest', 'oldest', 'deadline', 'title']),
  query('mine').optional().isBoolean(),
];
export const application = [
  id('jobId'),
  text('coverLetter', 10000),
  body('cvUpload').optional().isMongoId(),
];
export const applicationQuery = [
  ...paging,
  query('status').optional().isIn(applicationStatuses),
  ...['skill', 'university', 'search', 'company'].map((name) =>
    query(name).optional().isString().bail().isLength({ max: 200 }),
  ),
  query('from').optional().isISO8601(),
];
export const statusUpdate = [id('id'), body('status').isIn(providerStatuses)];
export const notes = (field) => [
  id('id'),
  body(field).isString().bail().isLength({ max: 10000 }),
];
export const interview = [
  body('application').isMongoId(),
  body('interviewDate').isISO8601({ strict: true }).withMessage('Use an ISO date.'),
  body('interviewTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('startsAt')
    .optional()
    .isISO8601()
    .bail()
    .matches(/(Z|[+-]\d{2}:\d{2})$/),
  body('durationMinutes').optional().isInt({ min: 15, max: 480 }),
  body('interviewType').isIn(interviewTypes),
  url('meetingLink'),
  text('physicalLocation', 500),
  text('notes', 5000),
  body('status').optional().isIn(interviewStatuses),
  body().custom((value) => {
    if (value.interviewType === 'Online' && !value.meetingLink)
      throw new Error('Online interviews require a meeting link.');
    if (value.interviewType !== 'Online' && !value.physicalLocation)
      throw new Error('Provide a location or phone number.');
    return true;
  }),
];
export const followup = [
  body('title').isString().bail().trim().isLength({ min: 1, max: 200 }),
  body('date').isISO8601(),
];
