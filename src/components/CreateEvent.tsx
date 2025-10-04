import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Upload, ArrowLeft, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockClubs, locations, mockEvents } from './mockData';

interface EventFormData {
  name: string;
  description: string;
  clubId: string;
  location: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  visibility: 'open' | 'club';
  maxAttendees: string;
  permissionLetter: File | null;
}

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editEventId = searchParams.get('edit');
  
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    clubId: '',
    location: '',
    date: undefined,
    startTime: '',
    endTime: '',
    visibility: 'open',
    maxAttendees: '',
    permissionLetter: null
  });
  
  const [loading, setLoading] = useState(false);
  const [clashWarning, setClashWarning] = useState<string | null>(null);

  const userClubs = mockClubs.filter(club => club.admins.includes(user?.id || ''));

  useEffect(() => {
    if (editEventId) {
      // Load event data for editing
      const event = mockEvents.find(e => e.id === editEventId);
      if (event) {
        setFormData({
          name: event.name,
          description: event.description,
          clubId: event.clubId,
          location: event.location,
          date: new Date(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
          visibility: event.visibility,
          maxAttendees: event.maxAttendees?.toString() || '',
          permissionLetter: null
        });
      }
    }
  }, [editEventId]);

  useEffect(() => {
    // Check for clashes when date, time, or location changes
    if (formData.date && formData.startTime && formData.endTime && formData.location) {
      checkForClashes();
    }
  }, [formData.date, formData.startTime, formData.endTime, formData.location]);

  const checkForClashes = () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.location) {
      setClashWarning(null);
      return;
    }

    const dateString = format(formData.date, 'yyyy-MM-dd');
    
    const clashes = mockEvents.filter(event => 
      event.id !== editEventId &&
      event.approved &&
      event.location === formData.location &&
      event.date === dateString &&
      ((event.startTime <= formData.startTime && event.endTime > formData.startTime) ||
       (event.startTime < formData.endTime && event.endTime >= formData.endTime) ||
       (event.startTime >= formData.startTime && event.endTime <= formData.endTime))
    );

    if (clashes.length > 0) {
      setClashWarning(`Schedule conflict with: ${clashes.map(c => c.name).join(', ')}`);
    } else {
      setClashWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error('Please select an event date');
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (clashWarning) {
      toast.error('Please resolve the schedule conflict before submitting');
      return;
    }

    setLoading(true);

    try {
      // In real app, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success(editEventId ? 'Event updated successfully!' : 'Event created successfully! It will be reviewed by the college admin.');
      navigate('/club-admin');
    } catch (error) {
      toast.error('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.includes('pdf')) {
        toast.error('Please upload a PDF file');
        return;
      }
      setFormData({ ...formData, permissionLetter: file });
      toast.success('Permission letter uploaded');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/club-admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{editEventId ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-muted-foreground">Fill in the details for your campus event</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Provide all the necessary information for your event. Events require college admin approval before being published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                placeholder="Enter event name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Club Selection */}
            <div className="space-y-2">
              <Label htmlFor="club">Club *</Label>
              <Select value={formData.clubId} onValueChange={(value) => setFormData({ ...formData, clubId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your club" />
                </SelectTrigger>
                <SelectContent>
                  {userClubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clash Warning */}
            {clashWarning && (
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">Schedule Conflict</p>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{clashWarning}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Please choose a different time or location to resolve this conflict.
                </p>
              </div>
            )}

            {/* Max Attendees */}
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Maximum Attendees (optional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                min="1"
              />
            </div>

            {/* Visibility */}
            <div className="space-y-3">
              <Label>Event Visibility</Label>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-1">
                  <div className="font-medium">Open to All Students</div>
                  <div className="text-sm text-muted-foreground">
                    {formData.visibility === 'open' ? 'All students can see and RSVP to this event' : 'Only club members can see and RSVP to this event'}
                  </div>
                </div>
                <Switch
                  checked={formData.visibility === 'open'}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibility: checked ? 'open' : 'club' })}
                />
              </div>
            </div>

            {/* Permission Letter */}
            <div className="space-y-2">
              <Label htmlFor="permissionLetter">Permission Letter (PDF)</Label>
              <div className="flex items-center gap-4">
                <label htmlFor="permissionLetter" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md hover:bg-muted transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                      {formData.permissionLetter ? formData.permissionLetter.name : 'Choose file'}
                    </span>
                  </div>
                  <input
                    id="permissionLetter"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a permission letter for your event. This is required for final approval by the college admin.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/club-admin')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !!clashWarning} className="flex-1">
                {loading ? 'Saving...' : (editEventId ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}