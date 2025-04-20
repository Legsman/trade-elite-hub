
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footer?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

const AuthLayout = ({
  children,
  title,
  description,
  footer,
  footerLink,
}: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-purple">Swift</span>Trade
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}{" "}
            {footerLink && (
              <Link
                to={footerLink.href}
                className="font-medium text-purple hover:text-purple-dark"
              >
                {footerLink.text}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
