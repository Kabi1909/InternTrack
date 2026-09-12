import { readStore, mutate, delay, uid } from './mockStore';
export const authService = {
  login: async ({ email, password }) => {
    const user = readStore().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user || password !== 'Demo123!')
      throw new Error(
        'Use a demo account with password Demo123!, or select quick demo access.',
      );
    return delay(user);
  },
  demo: (role) => delay(readStore().users.find((u) => u.role === role)),
  register: (values) =>
    mutate((data) => {
      if (data.users.some((u) => u.email.toLowerCase() === values.email.toLowerCase()))
        throw new Error('An account with this email already exists.');
      const { password, confirmPassword, ...safe } = values;
      const user = { ...safe, id: uid('u'), skills: [] };
      if (user.role === 'provider') {
        user.companyId = uid('c');
        data.companies.push({
          id: user.companyId,
          name: values.companyName,
          industry: values.industry,
          description: '',
          location: '',
          website: '',
          mark: values.companyName[0],
          color: '#174e3c',
        });
      }
      data.users.push(user);
      return user;
    }),
};
