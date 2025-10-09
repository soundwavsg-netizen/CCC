import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle2, Smartphone, RefreshCw } from 'lucide-react';

export default function WhatsAppSetup() {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/whatsapp/status`);
      const data = await response.json();
      setStatus(data.connected ? 'connected' : 'disconnected');
      return data.connected;
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus('error');
      return false;
    }
  };

  const fetchQR = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/whatsapp/qr`);
      const data = await response.json();
      if (data.qr) {
        setQrCode(data.qr);
      }
    } catch (error) {
      console.error('QR fetch failed:', error);
    }
  };

  const refreshConnection = async () => {
    setLoading(true);
    await checkStatus();
    if (status !== 'connected') {
      await fetchQR();
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
    fetchQR();
    
    // Poll every 3 seconds for status updates
    const interval = setInterval(async () => {
      const isConnected = await checkStatus();
      if (isConnected) {
        setQrCode('');
      } else {
        await fetchQR();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col" data-testid="whatsapp-setup-page">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#25D366] text-white hover:bg-[#25D366]">
              <Smartphone className="mr-1 h-3 w-3" /> WhatsApp Bot Setup
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
              CCC Digital WhatsApp Bot
            </h1>
            <p className="text-base text-[#475467] mb-8">
              Automated customer support for EDG inquiries, pricing, and consultation scheduling.
            </p>
          </div>

          {/* Status Alert */}
          {status === 'connected' && (
            <Alert className="mb-8 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ WhatsApp bot is connected and active on +65 8982 1301
              </AlertDescription>
            </Alert>
          )}

          {status === 'disconnected' && (
            <Alert className="mb-8 border-orange-200 bg-orange-50">
              <Smartphone className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                ⏳ WhatsApp bot is not connected. Please scan the QR code below.
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                ❌ Connection error. Please check if the WhatsApp service is running.
              </AlertDescription>
            </Alert>
          )}

          {/* QR Code Display */}
          {qrCode && status !== 'connected' && (
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0 mb-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-6">Scan QR Code with WhatsApp</h2>
                
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`}
                      alt="WhatsApp QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm text-[#475467]">
                  <p><strong>Instructions:</strong></p>
                  <ol className="text-left max-w-md mx-auto space-y-1">
                    <li>1. Open WhatsApp on your business phone (+65 8982 1301)</li>
                    <li>2. Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                    <li>3. Tap <strong>"Link a Device"</strong></li>
                    <li>4. Scan this QR code</li>
                  </ol>
                </div>
              </div>
            </Card>
          )}

          {/* Refresh Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={refreshConnection}
              disabled={loading || status === 'connected'}
              className="bg-[hsl(var(--secondary))] hover:bg-[#0AA099] text-white"
              data-testid="refresh-connection"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking Connection...
                </>
              ) : status === 'connected' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Connected
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
            </Button>
          </div>

          {/* Bot Features */}
          {status === 'connected' && (
            <Card className="p-8 rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.08)] border-0">
              <h3 className="text-xl font-semibold mb-4">🤖 Bot Features Active</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#25D366]">Automated Responses:</h4>
                  <ul className="text-sm text-[#475467] space-y-1">
                    <li>• EDG funding information</li>
                    <li>• Service pricing guides</li>
                    <li>• Consultation scheduling</li>
                    <li>• Business hours info</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#25D366]">Lead Management:</h4>
                  <ul className="text-sm text-[#475467] space-y-1">
                    <li>• Qualified leads to email</li>
                    <li>• Human handoff for complex queries</li>
                    <li>• Integration with CCC systems</li>
                    <li>• Analytics tracking</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-[#EAF7F5] rounded-lg">
                <p className="text-sm text-[#475467]">
                  <strong>Test it:</strong> Send "Hi" to +65 8982 1301 to see the bot in action!
                </p>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}