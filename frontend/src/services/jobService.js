import { readStore, delay, mutate, uid } from './mockStore';
export const jobService = {
 list:()=>delay(readStore().jobs),
 save:(job)=>mutate(data=>{const found=data.jobs.findIndex(j=>j.id===job.id);const result={...job,id:job.id||uid('j'),createdAt:job.createdAt||new Date().toISOString().slice(0,10)};if(found>=0)data.jobs[found]=result;else data.jobs.unshift(result);return result;}),
 close:id=>mutate(data=>{data.jobs.find(j=>j.id===id).status='Closed';}),
 remove:id=>mutate(data=>{data.jobs=data.jobs.filter(j=>j.id!==id);}),
 toggleSaved:(userId,jobId)=>mutate(data=>{const saved=data.saved[userId]||[];data.saved[userId]=saved.includes(jobId)?saved.filter(id=>id!==jobId):[...saved,jobId];})
};
