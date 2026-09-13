import User from '../models/User.js';
import { pick, success } from '../utils/response.js';
export async function updateMe(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: pick(req.body, ['name', 'email']) },
    { new: true, runValidators: true },
  );
  success(res, user, 'Account updated.');
}
export const getMe = (req, res) => success(res, req.user);
