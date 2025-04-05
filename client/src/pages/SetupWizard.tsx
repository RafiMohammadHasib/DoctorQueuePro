import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Info, Loader2, Map, Pin, Home, Settings, Users } from 'lucide-react';

// Define the type for clinic data
interface ClinicData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  website: string;
  description: string;
  specialties: string[];
  openingHours: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  acceptsInsurance: boolean;
  insuranceProviders: string[];
}

// Define the type for doctor data
interface DoctorData {
  name: string;
  title: string;
  specialty: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  bio: string;
  roomNumber: string;
  availableDays: string[];
  consultationDuration: number;
}

// Specialties for select dropdown
const specialties = [
  'General Practice',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Gynecology',
  'Ophthalmology',
  'Psychiatry',
  'Oncology',
  'Other',
];

// Days of week for doctor availability
const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Insurance providers
const insuranceProviders = [
  'Blue Cross',
  'Aetna',
  'Cigna',
  'United Healthcare',
  'Medicare',
  'Medicaid',
  'Humana',
  'Kaiser Permanente',
  'Other',
];

// Step interface
interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: 'Welcome',
    description: 'Introduction to the setup wizard',
    icon: <Home className="h-6 w-6" />,
  },
  {
    title: 'Clinic Details',
    description: 'Set up your clinic information',
    icon: <Settings className="h-6 w-6" />,
  },
  {
    title: 'Doctor Profile',
    description: 'Add doctor information',
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: 'Confirmation',
    description: 'Review and finish setup',
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
];

const SetupWizard: React.FC = () => {
  const { user } = useAuth();
  const [_location, setLocation] = useLocation();
  const [_, params] = useRoute('/setup/:step');
  const currentStep = params?.step ? parseInt(params.step) : 1;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize clinic data
  const [clinicData, setClinicData] = useState<ClinicData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
    website: '',
    description: '',
    specialties: [],
    openingHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: { open: '00:00', close: '00:00' },
    },
    acceptsInsurance: true,
    insuranceProviders: [],
  });

  // Initialize doctor data
  const [doctorData, setDoctorData] = useState<DoctorData>({
    name: user?.name || '',
    title: 'MD',
    specialty: '',
    licenseNumber: '',
    phoneNumber: '',
    email: user?.email || '',
    bio: '',
    roomNumber: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationDuration: 15,
  });

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Handle clinic data changes
  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClinicData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle doctor data changes
  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle specialty selection for clinic
  const handleSpecialtyChange = (value: string) => {
    if (!clinicData.specialties.includes(value)) {
      setClinicData(prev => ({
        ...prev,
        specialties: [...prev.specialties, value]
      }));
    }
  };

  // Handle specialty selection for doctor
  const handleDoctorSpecialtyChange = (value: string) => {
    setDoctorData(prev => ({
      ...prev,
      specialty: value
    }));
  };

  // Handle available days selection for doctor
  const handleDayChange = (day: string) => {
    setDoctorData(prev => {
      if (prev.availableDays.includes(day)) {
        return {
          ...prev,
          availableDays: prev.availableDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          availableDays: [...prev.availableDays, day]
        };
      }
    });
  };

  // Handle insurance providers selection
  const handleInsuranceProviderChange = (provider: string) => {
    setClinicData(prev => {
      if (prev.insuranceProviders.includes(provider)) {
        return {
          ...prev,
          insuranceProviders: prev.insuranceProviders.filter(p => p !== provider)
        };
      } else {
        return {
          ...prev,
          insuranceProviders: [...prev.insuranceProviders, provider]
        };
      }
    });
  };

  // Handle accepting insurance toggle
  const handleAcceptsInsuranceChange = (checked: boolean) => {
    setClinicData(prev => ({
      ...prev,
      acceptsInsurance: checked
    }));
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length) {
      setLocation(`/setup/${currentStep + 1}`);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setLocation(`/setup/${currentStep - 1}`);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, we would send this data to the server
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Submit clinic data
      await apiRequest('POST', '/api/clinics', clinicData);
      
      // Submit doctor data
      await apiRequest('POST', `/api/doctors/${user?.id}/profile`, doctorData);
      
      // Show success toast
      toast({
        title: "Setup completed!",
        description: "Your clinic and doctor profile have been set up successfully.",
      });
      
      // Redirect to the appropriate dashboard based on user role
      if (user?.role === 'admin') {
        setLocation('/admin');
      } else if (user?.role === 'doctor') {
        setLocation('/doctor');
      } else {
        setLocation('/reception');
      }
    } catch (error) {
      console.error('Error submitting setup data:', error);
      toast({
        title: "Setup failed",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl">Welcome to QueueMaster</CardTitle>
              <CardDescription className="text-lg mt-2">
                Let's set up your clinic and doctor profile in just a few steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-primary/10 p-6 mb-6">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thank you for choosing QueueMaster</h3>
                  <p className="text-center text-gray-600 max-w-xl">
                    This setup wizard will guide you through configuring your clinic and doctor 
                    profile. It will only take a few minutes to complete, and you'll be ready to 
                    manage your patient queue efficiently.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">What you'll need:</h4>
                    <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
                      <li>Your clinic's basic information (name, address, contact details)</li>
                      <li>Doctor credentials and specialties</li>
                      <li>Operating hours and availability</li>
                      <li>Optional: Insurance providers you accept</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNext}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>
                Set up your clinic's basic information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input
                    id="clinic-name"
                    name="name"
                    value={clinicData.name}
                    onChange={handleClinicChange}
                    placeholder="e.g., City Health Clinic"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="clinic-phone">Phone Number</Label>
                  <Input
                    id="clinic-phone"
                    name="phoneNumber"
                    value={clinicData.phoneNumber}
                    onChange={handleClinicChange}
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="clinic-email">Email Address</Label>
                  <Input
                    id="clinic-email"
                    name="email"
                    type="email"
                    value={clinicData.email}
                    onChange={handleClinicChange}
                    placeholder="e.g., info@cityhealthclinic.com"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="clinic-website">Website (Optional)</Label>
                  <Input
                    id="clinic-website"
                    name="website"
                    value={clinicData.website}
                    onChange={handleClinicChange}
                    placeholder="e.g., https://cityhealthclinic.com"
                  />
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="clinic-address">Street Address</Label>
                  <Input
                    id="clinic-address"
                    name="address"
                    value={clinicData.address}
                    onChange={handleClinicChange}
                    placeholder="e.g., 123 Main Street"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="clinic-city">City</Label>
                  <Input
                    id="clinic-city"
                    name="city"
                    value={clinicData.city}
                    onChange={handleClinicChange}
                    placeholder="e.g., Springfield"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <Label htmlFor="clinic-state">State</Label>
                    <Input
                      id="clinic-state"
                      name="state"
                      value={clinicData.state}
                      onChange={handleClinicChange}
                      placeholder="e.g., IL"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="clinic-zip">Zip Code</Label>
                    <Input
                      id="clinic-zip"
                      name="zipCode"
                      value={clinicData.zipCode}
                      onChange={handleClinicChange}
                      placeholder="e.g., 62704"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="clinic-description">Clinic Description</Label>
                <Textarea
                  id="clinic-description"
                  name="description"
                  value={clinicData.description}
                  onChange={handleClinicChange}
                  placeholder="Provide a brief description of your clinic..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Clinic Specialties</Label>
                  <span className="text-xs text-gray-500">Select all that apply</span>
                </div>
                <div className="grid md:grid-cols-3 gap-2">
                  {specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`specialty-${index}`}
                        checked={clinicData.specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyChange(specialty)}
                      />
                      <Label htmlFor={`specialty-${index}`} className="text-sm cursor-pointer">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="accepts-insurance"
                    checked={clinicData.acceptsInsurance}
                    onCheckedChange={(checked) => handleAcceptsInsuranceChange(checked as boolean)}
                  />
                  <Label htmlFor="accepts-insurance">Accepts Insurance</Label>
                </div>
                
                {clinicData.acceptsInsurance && (
                  <div className="mt-3 ml-7">
                    <div className="flex items-center justify-between">
                      <Label>Insurance Providers</Label>
                      <span className="text-xs text-gray-500">Select all that apply</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2 mt-2">
                      {insuranceProviders.map((provider, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`provider-${index}`}
                            checked={clinicData.insuranceProviders.includes(provider)}
                            onCheckedChange={() => handleInsuranceProviderChange(provider)}
                          />
                          <Label htmlFor={`provider-${index}`} className="text-sm cursor-pointer">
                            {provider}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 3:
        return (
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader>
              <CardTitle>Doctor Profile</CardTitle>
              <CardDescription>
                Set up your doctor information and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="doctor-name">Doctor Name</Label>
                  <Input
                    id="doctor-name"
                    name="name"
                    value={doctorData.name}
                    onChange={handleDoctorChange}
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="doctor-title">Title/Credentials</Label>
                  <Input
                    id="doctor-title"
                    name="title"
                    value={doctorData.title}
                    onChange={handleDoctorChange}
                    placeholder="e.g., MD, FACP"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="doctor-specialty">Specialty</Label>
                  <Select 
                    value={doctorData.specialty} 
                    onValueChange={handleDoctorSpecialtyChange}
                  >
                    <SelectTrigger id="doctor-specialty">
                      <SelectValue placeholder="Select a specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty, index) => (
                        <SelectItem key={index} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="doctor-license">License Number</Label>
                  <Input
                    id="doctor-license"
                    name="licenseNumber"
                    value={doctorData.licenseNumber}
                    onChange={handleDoctorChange}
                    placeholder="e.g., MD123456"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="doctor-phone">Phone Number</Label>
                  <Input
                    id="doctor-phone"
                    name="phoneNumber"
                    value={doctorData.phoneNumber}
                    onChange={handleDoctorChange}
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="doctor-email">Email Address</Label>
                  <Input
                    id="doctor-email"
                    name="email"
                    type="email"
                    value={doctorData.email}
                    onChange={handleDoctorChange}
                    placeholder="e.g., dr.johnson@cityhealthclinic.com"
                  />
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="doctor-bio">Professional Bio</Label>
                  <Textarea
                    id="doctor-bio"
                    name="bio"
                    value={doctorData.bio}
                    onChange={handleDoctorChange}
                    placeholder="Provide a brief professional bio..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="doctor-room">Room/Office Number</Label>
                  <Input
                    id="doctor-room"
                    name="roomNumber"
                    value={doctorData.roomNumber}
                    onChange={handleDoctorChange}
                    placeholder="e.g., 201"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="consultation-duration">Average Consultation Duration (minutes)</Label>
                  <Select 
                    value={doctorData.consultationDuration.toString()} 
                    onValueChange={(value) => 
                      setDoctorData(prev => ({ ...prev, consultationDuration: parseInt(value) }))
                    }
                  >
                    <SelectTrigger id="consultation-duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 30, 45, 60].map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Available Days</Label>
                  <span className="text-xs text-gray-500">Select all that apply</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                  {daysOfWeek.map((day, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        doctorData.availableDays.includes(day)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleDayChange(day)}
                    >
                      <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 4:
        return (
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader>
              <CardTitle>Confirmation</CardTitle>
              <CardDescription>
                Review your information and complete the setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b p-4">
                  <h3 className="font-medium text-lg">Clinic Information</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Clinic Name</h4>
                      <p>{clinicData.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                      <p>{clinicData.phoneNumber || 'Not provided'}</p>
                      <p>{clinicData.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <p>
                      {clinicData.address}, {clinicData.city}, {clinicData.state} {clinicData.zipCode}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Specialties</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {clinicData.specialties.length > 0 ? (
                        clinicData.specialties.map((specialty, index) => (
                          <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {specialty}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No specialties selected</span>
                      )}
                    </div>
                  </div>
                  
                  {clinicData.acceptsInsurance && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Insurance Providers</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {clinicData.insuranceProviders.length > 0 ? (
                          clinicData.insuranceProviders.map((provider, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                              {provider}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No providers selected</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b p-4">
                  <h3 className="font-medium text-lg">Doctor Information</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Name & Credentials</h4>
                      <p>{doctorData.name} {doctorData.title && `(${doctorData.title})`}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Specialty</h4>
                      <p>{doctorData.specialty || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                      <p>{doctorData.phoneNumber || 'Not provided'}</p>
                      <p>{doctorData.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Office</h4>
                      <p>Room: {doctorData.roomNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Availability</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {doctorData.availableDays.map((day, index) => (
                        <span key={index} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Consultation Duration</h4>
                    <p>{doctorData.consultationDuration} minutes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Almost there!</h4>
                  <p className="text-blue-700 mt-1">
                    Review your information above and click "Complete Setup" to finish the process.
                    You can always update these details later from your dashboard settings.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container px-4 mx-auto">
        {/* Progress Steps */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex items-center justify-between w-full relative">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 z-0" />
            
            {/* Steps */}
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;
              
              return (
                <div key={index} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden md:block">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;