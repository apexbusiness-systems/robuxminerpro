const Privacy = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground animate-slide-up">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Account information (username, email address)</li>
              <li>Usage data and mining statistics</li>
              <li>Device and browser information</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and operate the RobuxMiner service</li>
              <li>To process transactions and send related information</li>
              <li>To send technical notices and support messages</li>
              <li>To communicate with you about products, services, and events</li>
              <li>To monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              except as described in this privacy policy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>With service providers who assist in our operations</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
              <li>In connection with a business transaction</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. This includes 
              encryption, secure servers, and regular security audits.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and update your account information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Report concerns about data handling</li>
            </ul>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to improve your experience, 
              analyze usage patterns, and provide personalized content. You can control 
              cookie settings through your browser preferences.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you become 
              aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of 
              any changes by posting the new policy on this page and updating the "last updated" 
              date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this privacy policy or our data practices, 
              please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-muted-foreground">
                <strong>Email:</strong> privacy@robuxminer.pro<br />
                <strong>Address:</strong> RobuxMiner Privacy Team<br />
                123 Tech Street, Digital City, DC 12345
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;