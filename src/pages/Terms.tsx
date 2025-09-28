const Terms = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground animate-slide-up">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using RobuxMinerPro services, you accept and agree to be bound by 
              the terms and provision of this agreement. These Terms of Service constitute a 
              legally binding agreement between you and RobuxMinerPro.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              RobuxMinerPro provides a platform for Robux mining services. Our service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access to mining algorithms and tools</li>
              <li>Real-time analytics and reporting</li>
              <li>Customer support and assistance</li>
              <li>Secure transaction processing</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              As a user of our service, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Not attempt to circumvent or manipulate our systems</li>
              <li>Respect the rights of other users</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">4. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Attempting to hack, reverse engineer, or exploit our systems</li>
              <li>Creating multiple accounts to circumvent limitations</li>
              <li>Sharing account credentials with third parties</li>
              <li>Using automated tools or bots without authorization</li>
              <li>Engaging in fraudulent or illegal activities</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground mb-4">
              For paid services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Payments are processed securely through our payment partners</li>
              <li>Subscriptions are billed monthly or annually as selected</li>
              <li>Refunds are available within 30 days of purchase</li>
              <li>We reserve the right to change pricing with advance notice</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">6. Service Availability</h2>
            <p className="text-muted-foreground">
              While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
              Planned maintenance will be announced in advance, and we will work to minimize 
              any service disruptions.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of RobuxMinerPro are owned by us and are 
              protected by international copyright, trademark, and other intellectual property laws. 
              You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              RobuxMinerPro shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of our service. Our total liability 
              shall not exceed the amount paid by you for the service during the twelve months 
              preceding the claim.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to terminate or suspend your account at any time for violations 
              of these terms. You may also terminate your account at any time by contacting our 
              support team.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time. Changes will be effective immediately upon 
              posting. Your continued use of the service after changes constitutes acceptance 
              of the new terms.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-muted-foreground">
                <strong>Email:</strong> legal@robuxminer.pro<br />
                <strong>Address:</strong> RobuxMinerPro Legal Department<br />
                123 Tech Street, Digital City, DC 12345
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;