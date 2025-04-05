import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  ChevronRight, 
  Hospital, 
  User, 
  CreditCard, 
  MessageCircle, 
  BarChart4 
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Pricing tiers
  const pricingTiers = [
    {
      name: 'Basic',
      price: '$49',
      period: 'per month',
      features: [
        'Up to 2 doctors',
        'Queue management',
        'Patient notifications',
        'Email support',
        'Basic analytics'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$99',
      period: 'per month',
      features: [
        'Up to 10 doctors',
        'Advanced queue management',
        'SMS & Email notifications',
        'Priority support',
        'Advanced analytics',
        'Custom branding'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      features: [
        'Unlimited doctors',
        'Premium queue management',
        'Full notification suite',
        '24/7 dedicated support',
        'Enterprise analytics',
        'Custom integrations',
        'Multi-location support'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  // Feature list
  const features = [
    {
      icon: <Clock className="w-10 h-10 text-primary" />,
      title: 'Real-time Queue Updates',
      description: 'Keep patients informed with live updates on their position in the queue and estimated waiting times'
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: 'Patient Management',
      description: 'Easily manage patient records, history, and preferences for personalized care'
    },
    {
      icon: <MessageCircle className="w-10 h-10 text-primary" />,
      title: 'Automated Notifications',
      description: 'Send SMS and email notifications to patients when their turn is approaching'
    },
    {
      icon: <Hospital className="w-10 h-10 text-primary" />,
      title: 'Multi-Clinic Support',
      description: 'Manage multiple locations from a single dashboard with location-specific queues'
    },
    {
      icon: <BarChart4 className="w-10 h-10 text-primary" />,
      title: 'Advanced Analytics',
      description: 'Track wait times, patient flow, and clinic performance with detailed reports'
    },
    {
      icon: <User className="w-10 h-10 text-primary" />,
      title: 'Doctor Dashboard',
      description: 'Give doctors a clear view of their schedule and queues with a customized dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold">QueueMaster</h1>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">Log In</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center">
        <motion.div 
          className="lg:w-1/2 mb-10 lg:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Keep Patient Care <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">On Track</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Elevate your clinic's efficiency with our cutting-edge queue management system. Streamline patient flow and enhance the care experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth?tab=register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg">
                Start Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-gray-600 text-lg">
              Watch Demo
            </Button>
          </div>
          <div className="mt-10 flex items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-600 border-2 border-slate-800 flex items-center justify-center text-sm">
                  {i}
                </div>
              ))}
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold">1.2K+</p>
              <p className="text-sm text-gray-400">Clinics using our software</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="lg:w-1/2 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full h-[400px] bg-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-primary/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Clock className="h-16 w-16 text-primary" />
                </div>
                <p className="mt-6 text-xl font-bold">Queue Management Made Simple</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 transform rotate-6">
            <Card className="w-60 bg-red-500/90 text-white shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Waiting Time Reduced
                </h3>
                <p className="text-sm mt-1">Patients report 40% less waiting time</p>
              </CardContent>
            </Card>
          </div>
          <div className="absolute -top-5 -right-5 transform -rotate-6">
            <Card className="w-60 bg-green-500/90 text-white shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" /> Clinic Efficiency
                </h3>
                <p className="text-sm mt-1">Manage 30% more patients per day</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to streamline your clinic's patient flow and improve satisfaction
            </p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-slate-800/50 p-8 rounded-xl hover:bg-slate-800 transition-colors border border-slate-700 hover:border-primary/50"
                variants={itemVariants}
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our simple 4-step process to transform your clinic's queue management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary transform -translate-y-1/2 z-0" />
            
            {[
              { number: 1, title: "Set Up Your Clinic", description: "Configure your clinic details, doctor profiles, and queue settings" },
              { number: 2, title: "Register Patients", description: "Easily add patients to the queue with our reception kiosk" },
              { number: 3, title: "Manage Queue", description: "Track patient flow and make real-time adjustments as needed" },
              { number: 4, title: "Analyze & Optimize", description: "Use analytics to improve efficiency and patient satisfaction" }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="bg-slate-800 rounded-xl p-8 text-center relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your clinic's needs with our straightforward pricing
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div 
                key={index}
                className={`rounded-xl overflow-hidden ${
                  tier.popular 
                    ? 'bg-gradient-to-b from-primary/20 to-slate-800 border-2 border-primary/40 transform scale-105 shadow-xl shadow-primary/20' 
                    : 'bg-slate-800 border border-slate-700'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {tier.popular && (
                  <div className="bg-primary text-center py-1 text-sm font-medium">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-gray-400 ml-2">{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-3 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Need a custom solution for your large clinic or hospital?</p>
            <Button variant="outline" className="border-gray-600">
              Contact Our Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hear from clinics that have transformed their patient experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "QueueMaster transformed our busy clinic. Wait times are down 50% and patient satisfaction has never been higher.",
                author: "Dr. James Wilson",
                role: "Medical Director, City Health Clinic"
              },
              {
                quote: "The analytics alone are worth the investment. We've optimized our scheduling and can now see 30% more patients every day.",
                author: "Sarah Johnson",
                role: "Practice Manager, Family Care Center"
              },
              {
                quote: "Our patients love getting SMS updates about their queue status. They can grab coffee or run errands instead of sitting in our waiting room.",
                author: "Dr. Emily Chen",
                role: "Pediatrician, Children's Health Clinic"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-slate-800 p-8 rounded-xl border border-slate-700"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-6 text-primary">
                  {"★".repeat(5)}
                </div>
                <p className="text-lg mb-6 italic text-gray-300">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary bg-opacity-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Ready to Transform Your Clinic?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join over 1,200 clinics that have transformed their patient experience with QueueMaster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-gray-600 text-lg">
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-bold">QueueMaster</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Transforming clinic efficiency and patient experience with intelligent queue management.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} QueueMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;