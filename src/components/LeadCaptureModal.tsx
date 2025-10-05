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
  const modalRef = useFocusTrap(open);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !consent) return;

    setIsSubmitting(true);

    // Lead capture endpoint - configure in hosting/edge function
    const endpoint = null; // TODO: Configure lead capture endpoint
    if (endpoint) {
      try {
        const params = new URLSearchParams(window.location.search);
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            consent: true,
            source: 'hero',
            url: window.location.href,
            referrer: document.referrer || null,
            utm: {
              source: params.get('utm_source'),
              medium: params.get('utm_medium'),
              campaign: params.get('utm_campaign'),
            },
            ts: new Date().toISOString(),
          }),
        });
        setSubmitted(true);
      } catch (err) {
        console.warn('Lead capture failed:', err);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setEmail('');
    setConsent(false);
    setSubmitted(false);
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
                  I'm 13+ / parent consent obtained
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
