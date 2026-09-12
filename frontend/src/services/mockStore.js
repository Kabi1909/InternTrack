import { initialData } from '../data/mockData';
const key = 'interntrack.data.v1';
let memory;
export function readStore() { if(memory) return memory; try { memory = JSON.parse(localStorage.getItem(key)) || structuredClone(initialData); } catch { memory = structuredClone(initialData); } return memory; }
export function writeStore(data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch { throw new Error('Browser storage is full or unavailable. Your change could not be saved.'); } memory=data; window.dispatchEvent(new Event('interntrack:change')); return data; }
export const snapshot = () => structuredClone(readStore());
export const delay = (value) => new Promise(resolve=>setTimeout(()=>resolve(structuredClone(value)),180));
export const uid = (prefix) => prefix + crypto.randomUUID();
export function mutate(fn) { const data=snapshot(); const result=fn(data); writeStore(data); return Promise.resolve(result); }
export function notify(data,userId,title,message,type) {data.notifications.unshift({id:uid('n'),userId,title,message,type,read:false,createdAt:new Date().toISOString()});}
