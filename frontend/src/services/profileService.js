import {mutate} from './mockStore';
export const profileService={updateUser:(id,values)=>mutate(d=>{Object.assign(d.users.find(u=>u.id===id),values);}),updateCompany:(id,values)=>mutate(d=>{Object.assign(d.companies.find(c=>c.id===id),values);})};
