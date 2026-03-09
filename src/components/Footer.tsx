import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">KC</span>
              </div>
              <div>
                <h3 className="font-serif font-bold">Kakamega County</h3>
                <p className="text-xs text-secondary-foreground/70">Service Portal</p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/80">
              Empowering citizens to access county services efficiently and transparently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/submit-request" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Submit Request
                </Link>
              </li>
              <li>
                <Link to="/submit-complaint" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  File Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  Track Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-secondary-foreground/80">+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-secondary-foreground/80">services@kakamega.go.ke</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-secondary-foreground/80">
                  County Headquarters, Kakamega Town
                </span>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div>
            <h4 className="font-semibold mb-4">Office Hours</h4>
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-secondary-foreground/80">
                <p>Monday - Friday</p>
                <p>8:00 AM - 5:00 PM</p>
                <p className="mt-2">Saturday</p>
                <p>8:00 AM - 12:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
          <p>© {new Date().getFullYear()} Kakamega County Government. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
