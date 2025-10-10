import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowRight, Award, Info } from 'lucide-react';

export default function Grants() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds to Services page
    const timer = setTimeout(() => {
      navigate('/services-solutions');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen" data-testid="grants-redirect-page">
      <section className="py-20 bg-gradient-to-br from-[#EAF7F5] to-white flex-1 flex items-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-[hsl(var(--secondary))] text-white">
            <Info className="mr-1 h-3 w-3" /> Page Moved
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-6">
            EDG Funding is Now Part of Our Services
          </h1>
          
          <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-[#12B76A] flex items-center justify-center text-white mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold mb-4">EDG Support is Optional</h2>
              <p className="text-[#475467] mb-6">
                We've integrated EDG funding information into our main services. 
                EDG support is now positioned as an optional enhancement to help eligible 
                Singapore SMEs save up to 50% on qualifying automation and AI projects.
              </p>
              
              <div className="space-y-3">
                <Button 
                  asChild
                  className="w-full bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
                >
                  <a href="/services-solutions">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    View Our Services
                  </a>
                </Button>
                
                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-[hsl(var(--border))]"
                >
                  <a href="/edg">
                    <Award className="mr-2 h-4 w-4" />
                    Check EDG Eligibility
                  </a>
                </Button>
              </div>
              
              <p className="text-xs text-[#6B7280] mt-4">
                Redirecting to Services page in 3 seconds...
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
