// Mock data for production demo when backend is not available
export const mockUsers = [
  {
    id: '1',
    email: 'admin@campus.edu',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'organizer@demo.com',
    name: 'Demo Organizer',
    role: 'organizer'
  },
  {
    id: '3',
    email: 'student@demo.com',
    name: 'Demo Student',
    role: 'student'
  }
];

export const mockEvents = [
  {
    id: 'demo-event-1',
    name: 'Tech Talk: AI in Education',
    short_description: 'Exploring the future of AI in educational systems',
    description: 'Join us for an insightful discussion about how artificial intelligence is transforming education. Learn about the latest developments, challenges, and opportunities in this rapidly evolving field.',
    date: '2024-02-15',
    time: '14:00',
    venue: 'Main Auditorium',
    capacity: 100,
    organizer_id: 'demo-organizer',
    organizer_name: 'Event Organizer',
    approved_count: 23
  },
  {
    id: 'demo-event-2', 
    name: 'Campus Career Fair 2024',
    short_description: 'Meet top employers and discover career opportunities',
    description: 'Network with leading companies, learn about internship and full-time opportunities, and kickstart your career. Bring your resume and dress professionally.',
    date: '2024-02-20',
    time: '10:00',
    venue: 'Student Center',
    capacity: 200,
    organizer_id: 'demo-organizer',
    organizer_name: 'Event Organizer',
    approved_count: 67
  },
  {
    id: 'demo-event-3',
    name: 'Environmental Sustainability Workshop', 
    short_description: 'Learn about sustainable practices on campus',
    description: 'Discover practical ways to make our campus more environmentally friendly. Participate in hands-on activities and learn about recycling, energy conservation, and green initiatives.',
    date: '2024-02-25',
    time: '16:00',
    venue: 'Green Building Room 101',
    capacity: 50,
    organizer_id: 'demo-organizer',
    organizer_name: 'Event Organizer',
    approved_count: 12
  }
];

export const mockOrganizers = [
  {
    id: 'demo-organizer',
    name: 'Event Organizer',
    email: 'organizer@campus.edu'
  }
];
