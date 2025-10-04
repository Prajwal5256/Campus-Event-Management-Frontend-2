import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CalendarDays, Clock, MapPin, Users, Plus, Edit, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getEventsForClubAdmin, mockClubs } from './mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ClubAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userClubs = mockClubs.filter(club => club.admins.includes(user?.id || ''));
  const clubIds = userClubs.map(club => club.id);
  const events = getEventsForClubAdmin(clubIds);
  
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());
  const pendingEvents = events.filter(event => !event.approved);
  const approvedEvents = events.filter(event => event.approved);

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

  const handleEditEvent = (eventId: string) => {
    navigate(`/create-event?edit=${eventId}`);
  };

  const getStatusBadge = (event: any) => {
    if (!event.approved) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Pending Approval
      </Badge>;
    }
    return <Badge variant="default" className="flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      Approved
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Club Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your club events and activities</p>
          </div>
          <Button onClick={() => navigate('/create-event')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Event
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Your clubs:</span>
          {userClubs.map(club => (
            <Badge key={club.id} variant="secondary">{club.name}</Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold">{events.reduce((total, event) => total + event.attendees.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.filter(event => event.approved).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">Create your first event to get started!</p>
                <Button onClick={() => navigate('/create-event')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.filter(event => event.approved).map(event => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <div className="flex gap-1">
                        {getStatusBadge(event)}
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

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event.id)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex-1"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pending events</h3>
                <p className="text-muted-foreground">All your events have been reviewed!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingEvents.map(event => (
                <Card key={event.id} className="border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      {getStatusBadge(event)}
                    </div>
                    <CardDescription className="text-sm">{event.clubName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-md">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        This event is waiting for college admin approval. Make sure you've uploaded the required permission letter.
                      </p>
                    </div>
                    
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
                      {event.permissionLetterUrl && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Permission letter uploaded</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event.id)}
                      className="w-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No past events</h3>
                <p className="text-muted-foreground">Your event history will appear here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map(event => (
                <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <Badge variant="outline">Completed</Badge>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="w-full mt-3"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}