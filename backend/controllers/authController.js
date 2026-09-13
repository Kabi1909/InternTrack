import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import ProviderProfile from '../models/ProviderProfile.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { success } from '../utils/response.js';
export async function register(req, res) {
  const { name, email, password, role, university, degree, companyName, industry } =
    req.body;
  if (await User.exists({ email }))
    throw new ApiError(409, 'An account with this email already exists.');
  const user = await User.create({ name, email, password, role });
  let profile;
  try {
    profile =
      role === 'student'
        ? await StudentProfile.create({ user: user.id, university, degree })
        : await ProviderProfile.create({
            user: user.id,
            companyName: companyName || name,
            industry,
            contactEmail: email,
          });
  } catch (error) {
    await User.deleteOne({ _id: user.id });
    throw error;
  }
  return success(
    res,
    { token: generateToken(user), user, profile },
    'Account created successfully.',
    201,
  );
}
export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password +tokenVersion',
  );
  if (!user || !(await user.comparePassword(req.body.password)) || !user.isActive)
    throw new ApiError(401, 'Email or password is incorrect.');
  const profile = await (
    user.role === 'student' ? StudentProfile : ProviderProfile
  ).findOne({ user: user.id });
  return success(
    res,
    { token: generateToken(user), user, profile },
    'Logged in successfully.',
  );
}
export async function me(req, res) {
  const profile = await (
    req.user.role === 'student' ? StudentProfile : ProviderProfile
  ).findOne({ user: req.user.id });
  return success(res, { user: req.user, profile });
}
export async function logout(req, res) {
  await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
  return success(res, null, 'Logged out on all devices.');
}
