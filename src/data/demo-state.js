// Sample records for the public demo. Do not add real employee data.
export const INITIAL_STATE = {
      employees: [
        { id: 'EMP-101', name: 'Andrew Niles', email: 'andrew.niles@heroes.example', role: 'Head of HR', department: 'HR & Talent', mode: 'Office', status: 'Active', salary: 145000, country: 'United States', avatar: './avatars/profile.jpg' },
        { id: 'EMP-102', name: 'Sophia Chen', email: 'sophia.c@heroes.example', role: 'Staff Product Designer', department: 'Design', mode: 'Remote', status: 'Active', salary: 125000, country: 'Canada', avatar: './avatars/sophia.jpg' },
        { id: 'EMP-103', name: 'Marcus Vance', email: 'marcus.v@heroes.example', role: 'Senior Backend Architect', department: 'Engineering', mode: 'Office', status: 'Active', salary: 155000, country: 'United States', avatar: './avatars/marcus.jpg' },
        { id: 'EMP-104', name: 'Elena Rostova', email: 'elena.r@heroes.example', role: 'Lead Frontend Engineer', department: 'Engineering', mode: 'Office', status: 'On Leave', salary: 138000, country: 'Germany', avatar: './avatars/elena.jpg' },
        { id: 'EMP-105', name: 'David Kim', email: 'david.k@heroes.example', role: 'Product Manager', department: 'Product', mode: 'Remote', status: 'New Joinee', salary: 130000, country: 'South Korea', avatar: './avatars/david.jpg' },
        { id: 'EMP-106', name: 'Aaliyah Patel', email: 'aaliyah.p@heroes.example', role: 'Talent Acquisition Lead', department: 'HR & Talent', mode: 'Hybrid', status: 'Active', salary: 110000, country: 'United Kingdom', avatar: './avatars/aaliyah.jpg' },
      ],
      jobs: [
        { id: 'JOB-201', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Remote / SF', type: 'Full-time', salary: '$140k - $170k', status: 'Open', applicants: 42, tags: ['React', 'Node.js', 'PostgreSQL'] },
        { id: 'JOB-202', title: 'Lead UI/UX Product Designer', department: 'Design', location: 'New York (Hybrid)', type: 'Full-time', salary: '$130k - $155k', status: 'Open', applicants: 28, tags: ['Figma', 'Design Systems', 'UX Research'] },
        { id: 'JOB-203', title: 'Growth Marketing Director', department: 'Marketing', location: 'London / Remote', type: 'Full-time', salary: '$120k - $145k', status: 'Paused', applicants: 19, tags: ['SEO', 'Paid Media', 'Analytics'] },
      ],
      candidates: [
        { id: 'CAN-301', name: 'Liam Hemsworth', role: 'UI/UX Designer', stage: 'Applied', country: 'Australia', score: 4.8, salary: '$130,000', avatar: './avatars/liam.jpg' },
        { id: 'CAN-302', name: 'Clara Oswald', role: 'Python Developer', stage: 'Screening', country: 'United Kingdom', score: 4.6, salary: '$145,000', avatar: './avatars/profile.jpg' },
        { id: 'CAN-303', name: 'Mateo Rossi', role: 'Laravel Developer', stage: 'Interview', country: 'Italy', score: 4.9, salary: '$125,000', avatar: './avatars/mateo.jpg' },
        { id: 'CAN-304', name: 'Sora Takahashi', role: 'Product Designer', stage: 'Offer', country: 'Japan', score: 5.0, salary: '$135,000', avatar: './avatars/sora.jpg' },
      ],
      leaves: [
        { id: 'LEV-401', empName: 'Elena Rostova', type: 'Annual Paid Leave', startDate: '2026-02-15', endDate: '2026-02-22', status: 'Approved', days: 7, reason: 'Family Vacation' },
        { id: 'LEV-402', empName: 'Marcus Vance', type: 'Sick Leave', startDate: '2026-02-20', endDate: '2026-02-21', status: 'Pending', days: 2, reason: 'Flu Recovery' },
        { id: 'LEV-403', empName: 'Sophia Chen', type: 'Parental Leave', startDate: '2026-03-01', endDate: '2026-03-15', status: 'Approved', days: 14, reason: 'Maternity Leave' },
      ],
      interviews: [
        { id: 'INT-501', candidateName: 'Mateo Rossi', role: 'Laravel Developer', time: '10:00 - 11:00', day: 'today', avatar: './avatars/mateo.jpg' },
        { id: 'INT-502', candidateName: 'Clara Oswald', role: 'Python Senior Lead', time: '11:00 - 12:00', day: 'today', avatar: './avatars/profile.jpg' },
        { id: 'INT-503', candidateName: 'Liam Hemsworth', role: 'UI/UX Designer', time: '14:00 - 15:00', day: 'tomorrow', avatar: './avatars/liam.jpg' },
      ],
      events: [
        { id: 'EVT-1', dateDay: '18', dateMonth: 'FEB', title: 'Q1 Global All-Hands Town Hall', desc: 'Executive roadmap update & quarterly awards.' },
        { id: 'EVT-2', dateDay: '15', dateMonth: 'FEB', title: 'Tech Talk: Micro-Frontends', desc: 'Presented by Marcus Vance, Senior Architect.' },
        { id: 'EVT-3', dateDay: '10', dateMonth: 'FEB', title: 'Wellness & Mental Health Day', desc: 'No internal meetings after 12:00 PM.' },
        { id: 'EVT-4', dateDay: '09', dateMonth: 'FEB', title: 'Design System V3 Launch', desc: 'New UI kit guidelines for web and mobile.' },
        { id: 'EVT-5', dateDay: '08', dateMonth: 'FEB', title: 'Cybersecurity Workshop', desc: 'Mandatory SOC2 security compliance review.' },
        { id: 'EVT-6', dateDay: '05', dateMonth: 'FEB', title: 'Annual Employee Hackathon', desc: '3-day innovation sprint with grand prizes.' },
      ],
      projects: [
        { id: 'PRJ-1', title: 'HEROES Mobile App V2', dept: 'Engineering', status: 'Active', progress: 75, lead: 'Elena Rostova' },
        { id: 'PRJ-2', title: 'AI Resume Parser', dept: 'HR & Talent', status: 'Active', progress: 90, lead: 'Aaliyah Patel' },
        { id: 'PRJ-3', title: 'SOC-2 Compliance Audit', dept: 'Security', status: 'On Hold', progress: 40, lead: 'Marcus Vance' },
      ],
      happinessRate: 80,
      notifications: [
        { id: 1, title: 'New Job Application', msg: 'Liam Hemsworth applied for UI/UX Designer', time: '5m ago', unread: true },
        { id: 2, title: 'Leave Request', msg: 'Marcus Vance submitted Sick Leave request', time: '1h ago', unread: true },
      ],
      auditLogs: [
        { id: 1, action: 'SYSTEM_BOOT', details: 'HEROES HRIS State Initialized', timestamp: new Date().toLocaleTimeString() }
      ]
};
