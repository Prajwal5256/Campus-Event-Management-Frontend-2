import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Share2, Download, CheckCircle, XCircle, Edit } from 'lucide-react';
import { mockEvents, mockClubs } from './mockData';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

export default function EventDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isRSVPed, setIsRSVPed] = useState(false);
  
  const event = mockEvents.find(e => e.id === id);
  const club = mockClubs.find(c => c.id === event?.clubId);
  
  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Check if user has access to this event
  const hasAccess = 
    event.visibility === 'open' || 
    user?.clubs?.includes(event.clubId) || 
    user?.role === 'college_admin' ||
    (user?.role === 'club_admin' && club?.admins.includes(user.id));

  if (!hasAccess && !event.approved) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You don't have permission to view this event.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

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

  const handleRSVP = () => {
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      toast.error('This event is full');
      return;
    }
    
    setIsRSVPed(true);
    toast.success('RSVP confirmed! You will receive a confirmation email.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

  const isEventFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;
  const isEventPast = new Date(event.date) < new Date();
  const canRSVP = user?.role === 'student' && !isEventPast && !isEventFull && !isRSVPed;
  const isClubAdmin = user?.role === 'club_admin' && club?.admins.includes(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        {isClubAdmin && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/create-event?edit=${event.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Event
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>Organized by {event.clubName}</span>
                    <Badge variant={event.visibility === 'open' ? 'default' : 'secondary'}>
                      {event.visibility === 'open' ? 'Open to All' : 'Club Members Only'}
                    </Badge>
                  </CardDescription>
                </div>
                <div>
                  {event.approved ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">About this event</h3>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {event.attendees.length} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} confirmed
                    </p>
                  </div>
                </div>
              </div>

              {event.permissionLetterUrl && user?.role === 'college_admin' && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Permission Letter</h3>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Permission Letter
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Club Information */}
          <Card>
            <CardHeader>
              <CardTitle>About {event.clubName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{club?.description}</p>
              <div className="mt-4">
                <p className="text-sm font-medium">Club Members: {club?.members.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          {event.approved && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Join this Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEventPast ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">This event has ended</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{event.attendees.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.maxAttendees ? `of ${event.maxAttendees}` : ''} confirmed
                      </p>
                    </div>
                    
                    {canRSVP && (
                      <Button onClick={handleRSVP} className="w-full">
                        RSVP to this Event
                      </Button>
                    )}
                    
                    {isEventFull && (
                      <Button disabled className="w-full">
                        Event is Full
                      </Button>
                    )}
                    
                    {isRSVPed && (
                      <Button variant="secondary" disabled className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        You're Going!
                      </Button>
                    )}
                    
                    {user?.role !== 'student' && (
                      <p className="text-sm text-muted-foreground text-center">
                        Only students can RSVP to events
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Status for Non-Students */}
          {!event.approved && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-500" />
                  Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This event is waiting for college admin approval. It will be visible to students once approved.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attendees Preview */}
          {event.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Who's Going</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.attendees.slice(0, 5).map((attendeeId, index) => (
                    <div key={attendeeId} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {String.fromCharCode(65 + index)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Student {index + 1}</span>
                    </div>
                  ))}
                  {event.attendees.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      +{event.attendees.length - 5} more attendees
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}