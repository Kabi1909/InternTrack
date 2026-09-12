export const companies = [
 { id: 'c1', name: 'Linear', mark: '◒', color: '#7464cf', industry: 'Software', location: 'Colombo, Sri Lanka', description: 'We build thoughtful tools that help ambitious teams do their best work.', website: 'https://linear.app' },
 { id: 'c2', name: 'Notion', mark: 'N', color: '#282b29', industry: 'Productivity', location: 'Remote', description: 'Make it possible for every person, team, and company to tailor their software to solve any problem.', website: 'https://notion.so' },
 { id: 'c3', name: 'Spotify', mark: '≋', color: '#20824b', industry: 'Entertainment', location: 'Singapore', description: 'Unlock the potential of human creativity through music, technology, and a little imagination.', website: 'https://spotify.com' },
 { id: 'c4', name: 'Figma', mark: 'F', color: '#cf6552', industry: 'Design', location: 'Colombo, Sri Lanka', description: 'Help teams make beautiful, accessible products together.', website: 'https://figma.com' },
 { id: 'c5', name: 'Stripe', mark: 'S', color: '#6464d6', industry: 'Finance', location: 'Remote', description: 'Increase the GDP of the internet with better financial infrastructure.', website: 'https://stripe.com' },
 { id: 'c6', name: 'WSO2', mark: 'W', color: '#ca702c', industry: 'Software', location: 'Colombo, Sri Lanka', description: 'Build the next generation of secure, connected digital experiences.', website: 'https://wso2.com' }
];
const date = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
export const jobs = [
 ['j1','Frontend Developer Intern','c1','Internship','Hybrid','Software Development',['React','JavaScript','Tailwind CSS'],'LKR 45,000 – 65,000 / month',21],
 ['j2','Product Design Intern','c2','Internship','Remote','UI/UX Design',['Figma','Prototyping','UI/UX'],'USD 500 – 800 / month',14],
 ['j3','Data Analyst Intern','c3','Internship','Hybrid','Data Science',['Python','SQL','Analytics'],'SGD 1,200 – 1,600 / month',18],
 ['j4','Junior UI/UX Designer','c4','Full-time','Onsite','UI/UX Design',['Figma','Research','Design systems'],'LKR 100,000 – 150,000 / month',28],
 ['j5','Finance & Operations Intern','c5','Internship','Remote','Finance',['Excel','Finance','Communication'],'USD 600 – 900 / month',12],
 ['j6','Software Engineer Intern','c6','Internship','Hybrid','Software Development',['Java','React','Git'],'LKR 50,000 – 70,000 / month',25],
 ['j7','Growth Marketing Assistant','c2','Part-time','Remote','Marketing',['SEO','Content','Analytics'],'USD 400 – 600 / month',30],
 ['j8','Security Engineering Intern','c1','Internship','Hybrid','Cybersecurity',['Linux','Networking','Python'],'LKR 50,000 – 75,000 / month',10],
 ['j9','Business Operations Associate','c5','Full-time','Remote','Business',['Strategy','Excel','Communication'],'USD 1,000 – 1,400 / month',32],
 ['j10','Systems Engineering Intern','c6','Internship','Onsite','Engineering',['Linux','Java','Cloud'],'LKR 45,000 – 65,000 / month',19]
].map(([id,title,companyId,type,mode,category,skills,salary,deadline],i)=>({ id,title,companyId,type,mode,category,skills,salary,deadline:date(deadline),createdAt:date(-i-1),experience:i===3||i===8?'Entry level':'No experience',positions:3,status:'Active',description:'Start your next chapter with a team that cares about craft. You will work alongside experienced mentors on meaningful projects, learn by doing, and make an impact from day one.',responsibilities:'Collaborate with a cross-functional team on real customer challenges.\nContribute ideas, document your work, and participate in team reviews.\nLearn new tools and help deliver thoughtful, reliable solutions.',qualifications:'Currently pursuing or recently completed a relevant degree.\nA curious mindset and strong communication skills.\nA portfolio, personal project, or coursework that shows your potential.' }));
export const users = [
 {id:'u1',name:'Alex Morgan',email:'alex@interntrack.demo',role:'student',university:'University of Moratuwa',degree:'BSc in Computer Science',graduation:'2027',phone:'+94 77 123 4567',skills:['React','JavaScript','UI/UX','Python'],preferredRoles:'Frontend Developer, Product Designer',location:'Colombo, Sri Lanka',linkedin:'https://linkedin.com',github:'https://github.com',cv:'Alex_Morgan_Resume.pdf'},
 {id:'u2',name:'Jamie Taylor',email:'jamie@interntrack.demo',role:'provider',companyId:'c1'},
 {id:'u3',name:'Sam Fernando',email:'sam@interntrack.demo',role:'student',university:'University of Colombo',degree:'BSc in Software Engineering',graduation:'2026',skills:['React','TypeScript','Node.js'],cv:'Sam_Fernando_Resume.pdf',linkedin:'https://linkedin.com',github:'https://github.com'},
 {id:'u4',name:'Priya Perera',email:'priya@interntrack.demo',role:'student',university:'SLIIT',degree:'BSc in Information Technology',graduation:'2027',skills:['Python','SQL','React'],cv:'Priya_Perera_Resume.pdf',linkedin:'https://linkedin.com',github:'https://github.com'}
];
export const statuses = ['Applied','Under Review','Shortlisted','Interview Scheduled','Offered','Rejected','Withdrawn'];
export const applications = [
 ['a1','u1','j1','Interview Scheduled',-12],['a2','u1','j2','Under Review',-8],['a3','u1','j3','Applied',-3],['a4','u1','j6','Shortlisted',-7],['a5','u1','j4','Rejected',-20],['a6','u1','j5','Offered',-16],['a7','u3','j1','Under Review',-4],['a8','u4','j8','Applied',-2]
].map(([id,userId,jobId,status,offset])=>({id,userId,jobId,status,appliedAt:date(offset),updatedAt:date(-1),cv:users.find(u=>u.id===userId).cv,coverLetter:'I am excited to apply and contribute my curiosity, technical skills, and collaborative approach to your team. My recent projects have given me practical experience, and I would love to continue learning with you.',notes:'',privateNotes:'',history:[{status:'Applied',date:date(offset)},...(status==='Applied'?[]:[{status,date:date(-1)}])]}));
export const interviews = [{id:'i1',applicationId:'a1',jobId:'j1',userId:'u1',date:date(3),time:'10:00',type:'Video call',link:'https://meet.google.com',location:'',notes:'A friendly conversation about your projects and experience.',status:'Upcoming'}, {id:'i2',applicationId:'a6',jobId:'j5',userId:'u1',date:date(-5),time:'14:30',type:'Video call',link:'https://meet.google.com',location:'',notes:'Meet the finance team.',status:'Completed'}];
export const notifications = [
 {id:'n1',userId:'u1',title:'Your next conversation is booked',message:'Your interview for Frontend Developer Intern at Linear is scheduled. You’ve got this!',type:'Interview scheduled',createdAt:date(0),read:false},
 {id:'n2',userId:'u1',title:'A little closer to your next chapter',message:'WSO2 shortlisted your application for Software Engineer Intern.',type:'Application status changed',createdAt:date(-1),read:false},
 {id:'n3',userId:'u1',title:'An opportunity worth a second look',message:'Security Engineering Intern at Linear closes soon. Complete your application when you’re ready.',type:'Deadline approaching',createdAt:date(-2),read:true},
 {id:'n4',userId:'u2',title:'Meet your next great teammate',message:'Sam Fernando applied for Frontend Developer Intern.',type:'New applicant received',createdAt:date(0),read:false},
 {id:'n5',userId:'u2',title:'Your vacancy closes soon',message:'Review applicants for Security Engineering Intern before the deadline.',type:'Job closing soon',createdAt:date(-1),read:false}
];
export const categories = ['Software Development','UI/UX Design','Data Science','Cybersecurity','Marketing','Business','Engineering','Finance'];
export const initialData = {users,companies,jobs,applications,interviews,notifications,saved:{u1:['j2','j4','j8']},followups:[{id:'f1',userId:'u1',date:date(6),title:'Follow up with Notion'}]};
