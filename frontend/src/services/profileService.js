import { mutate } from './mockStore.js';

export const profileService = {
  updateUser: (id, values) =>
    mutate((data) => {
      if (
        data.users.some(
          (user) =>
            user.id !== id && user.email.toLowerCase() === values.email?.toLowerCase(),
        )
      ) {
        throw new Error('This email address already belongs to another demo account.');
      }
      const user = data.users.find((item) => item.id === id);
      if (!user) throw new Error('Profile not found.');
      // Identity and role stay fixed during a profile edit.
      const { id: ignoredId, role, companyId, ...profile } = values;
      Object.assign(user, profile);
    }),

  updateCompany: (id, values) =>
    mutate((data) => {
      const company = data.companies.find((item) => item.id === id);
      if (!company) throw new Error('Company profile not found.');
      const { id: ignoredId, ...profile } = values;
      Object.assign(company, profile);
    }),
};
