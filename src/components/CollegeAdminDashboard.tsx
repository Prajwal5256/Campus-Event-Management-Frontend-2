import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { CalendarDays, Clock, MapPin, Users, FileText, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { getPendingEvents, mockEvents } from './mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function CollegeAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const pendingEvents = getPendingEvents();
  const approvedEvents = mockEvents.filter(event => event.approved);
  const totalEvents = mockEvents.length;
  const totalAttendees = mockEvents.reduce((total, event) => total + event.attendees.length, 0);

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

  const handleApproveEvent = (eventId: string) => {
    // In real app, this would call the backend API
    toast.success('Event approved successfully!');
  };

  const handleRejectEvent = (eventId: string) => {
    // In real app, this would call the backend API
    toast.success('Event rejected. The club admin has been notified.');
  };

  const checkForClashes = (event: any) => {
    const clashes = mockEvents.filter(e => 
      e.id !== event.id &&
      e.approved &&
      e.location === event.location &&
      e.date === event.date &&
      ((e.startTime <= event.startTime && e.endTime > event.startTime) ||
       (e.startTime < event.endTime && e.endTime >= event.endTime) ||
       (e.startTime >= event.startTime && e.endTime <= event.endTime))
    );
    return clashes;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">College Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and manage campus events</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Events</p>
                <p className="text-2xl font-bold">{approvedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
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
                <p className="text-2xl font-bold">{totalAttendees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingEvents.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingEvents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Events</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground">No events pending review at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map(event => {
                const clashes = checkForClashes(event);
                return (
                  <Card key={event.id} className="border-orange-200 dark:border-orange-800">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <CardDescription className="text-sm">{event.clubName}</CardDescription>
                        </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Pending Review
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                          <span>
                            {event.visibility === 'open' ? 'Open to All' : 'Club Only'}
                          </span>
                        </div>
                      </div>

                      {clashes.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            ⚠️ Schedule Conflict Detected
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            This event conflicts with: {clashes.map(c => c.name).join(', ')}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.permissionLetterUrl ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">Permission letter uploaded</span>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Permission Letter</DialogTitle>
                                    <DialogDescription>
                                      Permission letter for {event.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="p-4 bg-muted rounded-md">
                                    <p className="text-sm">
                                      This would display the uploaded permission letter document.
                                      In a real application, this would show the actual PDF or document content.
                                    </p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-400">No permission letter</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectEvent(event.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveEvent(event.id)}
                            disabled={clashes.length > 0}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{event.clubName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                      <span>{event.attendees.length} attending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge 
                      variant={event.approved ? "default" : "destructive"}
                      className={event.approved ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                    >
                      {event.approved ? 'Approved' : 'Pending'}
                    </Badge>
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
                    <span>{event.attendees.length} attending</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}