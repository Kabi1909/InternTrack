import {mutate} from './mockStore';
export const notificationService={markRead:id=>mutate(d=>{d.notifications.find(n=>n.id===id).read=true;}),markAll:userId=>mutate(d=>{d.notifications.filter(n=>n.userId===userId).forEach(n=>n.read=true);})};
