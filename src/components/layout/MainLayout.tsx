
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNotificationToasts } from "@/hooks/useNotificationToasts";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Enable real-time notification toasts
  useNotificationToasts();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
