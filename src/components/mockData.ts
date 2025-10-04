export interface Event {
  id: string;
  name: string;
  description: string;
  clubId: string;
  clubName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  visibility: 'open' | 'club';
  permissionLetterUrl?: string;
  approved: boolean;
  attendees: string[];
  maxAttendees?: number;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  admins: string[];
  members: string[];
}

export const mockClubs: Club[] = [
  {
    id: 'club1',
    name: 'Tech Club',
    description: 'A club for technology enthusiasts',
    admins: ['2'],
    members: ['1', '4', '5']
  },
  {
    id: 'club2',
    name: 'Drama Society',
    description: 'For students passionate about theater and performing arts',
    admins: ['6'],
    members: ['1', '7', '8']
  },
  {
    id: 'club3',
    name: 'Photography Club',
    description: 'Capturing moments and creating memories',
    admins: ['9'],
    members: ['4', '5', '7']
  },
  {
    id: 'club4',
    name: 'Music Society',
    description: 'For music lovers and performers',
    admins: ['10'],
    members: ['1', '8', '9']
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'JavaScript Workshop',
    description: 'Learn the fundamentals of JavaScript programming with hands-on exercises and real-world examples.',
    clubId: 'club1',
    clubName: 'Tech Club',
    location: 'Computer Lab A',
    date: '2024-10-15',
    startTime: '14:00',
    endTime: '16:00',
    visibility: 'open',
    permissionLetterUrl: '/documents/tech-workshop-permission.pdf',
    approved: true,
    attendees: ['1', '4', '5'],
    maxAttendees: 30
  },
  {
    id: '2',
    name: 'Annual Drama Performance',
    description: 'Join us for our annual drama performance featuring classic and contemporary plays.',
    clubId: 'club2',
    clubName: 'Drama Society',
    location: 'Main Auditorium',
    date: '2024-10-20',
    startTime: '18:00',
    endTime: '21:00',
    visibility: 'open',
    permissionLetterUrl: '/documents/drama-performance-permission.pdf',
    approved: true,
    attendees: ['1', '7', '8', '9'],
    maxAttendees: 200
  },
  {
    id: '3',
    name: 'Photography Exhibition',
    description: 'Showcase your best photographs in our annual exhibition.',
    clubId: 'club3',
    clubName: 'Photography Club',
    location: 'Art Gallery',
    date: '2024-10-25',
    startTime: '10:00',
    endTime: '17:00',
    visibility: 'club',
    permissionLetterUrl: '/documents/photo-exhibition-permission.pdf',
    approved: false,
    attendees: ['4', '5'],
    maxAttendees: 50
  },
  {
    id: '4',
    name: 'React Advanced Concepts',
    description: 'Deep dive into advanced React concepts including hooks, context, and performance optimization.',
    clubId: 'club1',
    clubName: 'Tech Club',
    location: 'Computer Lab B',
    date: '2024-10-18',
    startTime: '15:00',
    endTime: '17:30',
    visibility: 'club',
    approved: false,
    attendees: ['1'],
    maxAttendees: 25
  },
  {
    id: '5',
    name: 'Open Mic Night',
    description: 'Show off your musical talents at our monthly open mic night.',
    clubId: 'club4',
    clubName: 'Music Society',
    location: 'Student Center',
    date: '2024-10-22',
    startTime: '19:00',
    endTime: '22:00',
    visibility: 'open',
    permissionLetterUrl: '/documents/open-mic-permission.pdf',
    approved: true,
    attendees: ['1', '8', '9', '10'],
    maxAttendees: 100
  }
];

export const locations = [
  'Main Auditorium',
  'Computer Lab A',
  'Computer Lab B',
  'Seminar Hall 1',
  'Seminar Hall 2',
  'Art Gallery',
  'Student Center',
  'Library Conference Room',
  'Outdoor Amphitheater',
  'Sports Complex'
];

export const getEventsForUser = (userId: string, userRole: string, userClubs: string[]) => {
  return mockEvents.filter(event => {
    if (!event.approved && userRole !== 'college_admin') {
      return false;
    }
    
    if (event.visibility === 'open') {
      return true;
    }
    
    if (event.visibility === 'club') {
      return userClubs.includes(event.clubId) || userRole === 'college_admin';
    }
    
    return false;
  });
};

export const getEventsForClubAdmin = (clubIds: string[]) => {
  return mockEvents.filter(event => clubIds.includes(event.clubId));
};

export const getPendingEvents = () => {
  return mockEvents.filter(event => !event.approved);
};