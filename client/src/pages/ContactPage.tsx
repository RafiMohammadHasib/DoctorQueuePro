import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, ArrowRight, Send } from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real application, you would send this data to your backend
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // For now, just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Message Sent',
        description: 'Thank you for contacting us. We\'ll get back to you soon!',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while sending your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-16 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact QueueMaster</h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Have questions or need assistance? Get in touch with our team today.
        </p>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Sending Message...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-blue-800 text-white shadow-xl">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription className="text-blue-200">
                  Reach out to us using any of the methods below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-blue-200">support@queuemaster.com</p>
                    <p className="text-blue-200">sales@queuemaster.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-blue-200">+1 (555) 123-4567</p>
                    <p className="text-blue-200">Mon-Fri, 9am-5pm EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <p className="text-blue-200">
                      123 Queue Street, Suite 456<br />
                      Health City, HC 12345<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-blue-300 mt-1" />
                  <div>
                    <h3 className="font-medium">Business Hours</h3>
                    <p className="text-blue-200">
                      Monday-Friday: 9:00 AM - 5:00 PM<br />
                      Saturday-Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Support Options</CardTitle>
                <CardDescription>
                  We offer multiple ways to get the help you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium mb-2">Live Chat Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Chat with our support team in real-time during business hours.
                  </p>
                  <Button variant="outline" className="w-full">
                    Start Chat <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium mb-2">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Find answers to common questions in our help center.
                  </p>
                  <Button variant="outline" className="w-full">
                    Browse Articles <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Find quick answers to the most common questions about QueueMaster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            {
              q: "How can I request a demo of QueueMaster?",
              a: "You can request a demo by filling out the contact form on this page or by emailing sales@queuemaster.com. Our team will schedule a personalized demonstration at your convenience."
            },
            {
              q: "Is QueueMaster suitable for small clinics?",
              a: "Absolutely! QueueMaster is designed to scale with your needs. Our Basic plan is perfect for small clinics with up to 2 doctors, while our Professional and Enterprise plans accommodate larger practices."
            },
            {
              q: "How long does it take to set up QueueMaster?",
              a: "Most clinics can be up and running with QueueMaster in less than a day. Our setup wizard guides you through the process, and our support team is available to help if needed."
            },
            {
              q: "Can patients check their queue status remotely?",
              a: "Yes, patients receive SMS and email notifications about their queue status. They can also view their position in the queue through a dedicated monitor display or mobile interface."
            },
          ].map((faq, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}