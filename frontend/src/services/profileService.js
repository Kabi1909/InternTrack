import api from './api.js';
import { refreshData } from './serviceUtils.js';
import { uploadDataUrl } from './uploadService.js';
export const profileService = {
  async updateUser(id, values) {
    await api.put('/users/me', { name: values.name, email: values.email });
    await api.put('/students/profile', {
      phone: values.phone || '',
      university: values.university || '',
      degree: values.degree || '',
      graduationYear: values.graduation ? Number(values.graduation) : null,
      skills: values.skills || [],
      preferredJobRoles: (values.preferredRoles || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      preferredWorkLocation: values.location || '',
      linkedinUrl: values.linkedin || '',
      githubUrl: values.github || '',
      bio: values.bio || '',
    });
    if (values.picture?.startsWith('data:'))
      await uploadDataUrl('/students/profile/picture', values.picture, 'profile');
    if (values.cvData?.startsWith('data:'))
      await uploadDataUrl('/students/profile/cv', values.cvData, values.cv);
    await refreshData();
  },
  async updateCompany(id, values) {
    await api.put('/providers/profile', {
      companyName: values.name,
      companyDescription: values.description || '',
      website: values.website || '',
      industry: values.industry || '',
      location: values.location || '',
      contactEmail: values.contactEmail || '',
    });
    if (values.picture?.startsWith('data:'))
      await uploadDataUrl('/providers/profile/logo', values.picture, 'company-logo');
    await refreshData();
  },
};
