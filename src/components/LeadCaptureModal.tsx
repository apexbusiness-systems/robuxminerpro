import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadCaptureModal = ({ open, onOpenChange }: LeadCaptureModalProps) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const modalRef = useFocusTrap(open);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!email || !consent) return;

    setIsSubmitting(true);

    const payload = {
      email,
      consent: true,
      source: 'hero',
      url: globalThis.window.location.href,
      referrer: document.referrer || null,
      utm: {
        source: new URLSearchParams(globalThis.window.location.search).get('utm_source'),
        medium: new URLSearchParams(globalThis.window.location.search).get('utm_medium'),
        campaign: new URLSearchParams(globalThis.window.location.search).get('utm_campaign'),
      },
      timestamp: new Date().toISOString(),
    };

    const endpoint = import.meta.env.VITE_LEADS_ENDPOINT_URL;
    if (endpoint) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const apiKey = import.meta.env.VITE_LEADS_API_KEY;
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }
        setSubmitted(true);
      } catch (err) {
        console.warn('Lead capture failed, falling back to local storage:', err);
        setSubmitError('Unable to connect to server. Best effort saved.');
        try {
           globalThis.window.localStorage.setItem('rmp_pending_lead', JSON.stringify(payload));
        } catch (storageErr) {
           console.warn('Failed to save to localStorage', storageErr);
        }
      }
    } else {
      try {
         globalThis.window.localStorage.setItem('rmp_pending_lead', JSON.stringify(payload));
         setSubmitted(true);
      } catch (storageErr) {
         console.warn('Failed to save to localStorage', storageErr);
         setSubmitError('Failed to save data offline.');
      }
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setEmail('');
    setConsent(false);
    setSubmitted(false);
    setSubmitError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md" 
        ref={modalRef}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClose();
          }
        }}
      >
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Start earning Robux legitimately</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {submitError && (
                 <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {submitError}
                 </div>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  required
                />
                <Label
                  htmlFor="consent"
                  className="text-sm leading-tight cursor-pointer"
                >
                  I&apos;m 13+ / parent consent obtained
                </Label>
              </div>

              <p className="text-xs text-muted-foreground">
                We never ask for your password
              </p>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !consent || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Get Started'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="text-4xl mb-4">✓</div>
            <DialogHeader>
              <DialogTitle>Check your inbox</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              We've sent you next steps to start earning Robux the right way.
            </p>
            <a
              href="https://discord.gg/robuxminerpro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-primary hover:underline mt-4"
            >
              Join our Discord community (optional)
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
