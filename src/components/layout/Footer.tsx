
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-purple">Swift</span>Trade
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The premium marketplace for verified traders. Exchange luxury goods and collectibles at trade rates.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/listings/cars" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cars
                </Link>
              </li>
              <li>
                <Link to="/listings/commercials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Commercials
                </Link>
              </li>
              <li>
                <Link to="/listings/watches" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Luxury Watches
                </Link>
              </li>
              <li>
                <Link to="/listings/homes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Homes
                </Link>
              </li>
              <li>
                <Link to="/listings/collectables" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collectables
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} SwiftTrade Ltd. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
