import api from './api.js';
import { mutateRequest } from './serviceUtils.js';
import { uploadDataUrl } from './uploadService.js';
import { normalizeApplication } from './normalizers.js';
export const applicationService = {
  apply: async (values) => {
    let cvUpload = values.cvUpload;
    if (values.cvData?.startsWith('data:'))
      cvUpload = (await uploadDataUrl('/students/profile/cv', values.cvData, values.cv))
        .id;
    const application = await mutateRequest(
      api.post(`/applications/${values.jobId}`, {
        coverLetter: values.coverLetter,
        ...(cvUpload ? { cvUpload } : {}),
      }),
    );
    return normalizeApplication(application);
  },
  update: async (id, changes) => {
    let result;
    if (changes.status)
      result = await mutateRequest(
        changes.status === 'Withdrawn'
          ? api.patch(`/applications/${id}/withdraw`)
          : api.patch(`/applications/${id}/status`, { status: changes.status }),
      );
    if ('notes' in changes)
      result = await mutateRequest(
        api.patch(`/applications/${id}/notes`, { personalNotes: changes.notes }),
      );
    if ('privateNotes' in changes)
      result = await mutateRequest(
        api.patch(`/applications/${id}/provider-notes`, {
          providerNotes: changes.privateNotes,
        }),
      );
    return normalizeApplication(result);
  },
};
