import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarDays, Clock, MapPin, Users, Search, Filter } from 'lucide-react';
import { getEventsForUser, mockClubs } from './mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterClub, setFilterClub] = useState('all');
  
  const events = getEventsForUser(user?.id || '', user?.role || '', user?.clubs || []);
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || event.location === filterLocation;
    const matchesClub = filterClub === 'all' || event.clubId === filterClub;
    
    return matchesSearch && matchesLocation && matchesClub;
  });

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < new Date());

  const userClubNames = mockClubs
    .filter(club => user?.clubs?.includes(club.id))
    .map(club => club.name);

  const locations = [...new Set(events.map(event => event.location))];
  const clubs = [...new Set(events.map(event => ({ id: event.clubId, name: event.clubName })))];

  const handleRSVP = (eventId: string) => {
    // In real app, this would call the backend API
    toast.success('RSVP confirmed! You will receive a confirmation email.');
  };

  const isRSVPed = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.attendees.includes(user?.id || '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Discover and join exciting campus events</p>
        </div>
        
        {userClubNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">Your clubs:</span>
            {userClubNames.map(clubName => (
              <Badge key={clubName} variant="secondary">{clubName}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterClub} onValueChange={setFilterClub}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {clubs.map(club => (
                  <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No upcoming events found</h3>
              <p className="text-muted-foreground">Check back later for new events!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <div className="flex gap-1">
                      <Badge variant={event.visibility === 'open' ? 'default' : 'secondary'}>
                        {event.visibility === 'open' ? 'Open' : 'Club Only'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{event.clubName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.attendees.length} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isRSVPed(event.id) ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isRSVPed(event.id)) {
                        handleRSVP(event.id);
                      }
                    }}
                    disabled={isRSVPed(event.id) || (event.maxAttendees && event.attendees.length >= event.maxAttendees)}
                  >
                    {isRSVPed(event.id) ? 'Already RSVP\'d' : 
                     (event.maxAttendees && event.attendees.length >= event.maxAttendees) ? 'Event Full' : 'RSVP'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.slice(0, 6).map(event => (
              <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant="outline">Past</Badge>
                  </div>
                  <CardDescription className="text-sm">{event.clubName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.attendees.length} attended</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}