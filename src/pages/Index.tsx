
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

const features = [
  {
    name: "Verified Traders Only",
    description:
      "Our exclusive network ensures you're only dealing with professional traders who meet our strict criteria.",
    icon: Shield,
  },
  {
    name: "Trade-Rate Pricing",
    description:
      "Access wholesale and below-retail pricing unavailable to the general public.",
    icon: TrendingUp,
  },
  {
    name: "Secure Transactions",
    description:
      "Our platform provides a secure environment for negotiating and completing high-value trades.",
    icon: Check,
  },
  {
    name: "Active Trader Community",
    description:
      "Join thousands of active traders moving premium inventory across the UK daily.",
    icon: Users,
  },
];

const categories = [
  {
    name: "Luxury Vehicles",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/listings/cars",
  },
  {
    name: "Commercial Vehicles",
    image: "https://images.unsplash.com/photo-1519581246177-95a13d73f9ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/listings/commercials",
  },
  {
    name: "Luxury Watches",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/listings/watches",
  },
  {
    name: "Premium Properties",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=300&q=80",
    link: "/listings/homes",
  },
];

const testimonials = [
  {
    content:
      "Swift Trade has transformed how I source inventory for my dealership. Their verification process keeps out time-wasters and ensures I'm only dealing with serious professionals.",
    author: "James Wilson",
    role: "Luxury Car Dealer",
  },
  {
    content:
      "The platform's ease of use and quality of listed items is unmatched. I've completed over 30 high-value transactions in just 6 months.",
    author: "Sarah Thompson",
    role: "Watch Collector & Trader",
  },
  {
    content:
      "As someone who deals in commercial properties, Swift Trade has provided an invaluable network of verified property traders. The direct messaging system makes negotiations quick and efficient.",
    author: "Michael Richardson",
    role: "Commercial Property Investor",
  },
];

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-background to-muted/50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                <span className="block">Trade Better with</span>
                <span className="block text-purple">Swift Trade</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                The exclusive marketplace for verified traders to exchange premium assets at trade rates. Access exclusive deals on cars, commercials, luxury watches, and high-end properties.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row sm:gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="mb-4 sm:mb-0">
                    <Link to="/signup">Join the Network</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/listings">Browse Listings</Link>
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Membership requires verification. Only for professional traders.
                </p>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-background rounded-lg overflow-hidden">
                  <img
                    className="w-full"
                    src="https://images.unsplash.com/photo-1518987048-93e29699e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Luxury watch on display"
                  />
                  <div className="absolute inset-0 bg-dark-charcoal opacity-10"></div>
                  <Link
                    to="/listings/watches"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex items-center justify-center w-16 h-16 rounded-full bg-purple text-white">
                      <ArrowRight className="w-6 h-6" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-12 bg-background" id="categories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Premium Categories</h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Discover exceptional assets across our specialized categories
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  <div className="mt-2 flex items-center text-white group-hover:underline">
                    <span>View listings</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Swift Trade</h2>
            <p className="mt-4 text-xl text-muted-foreground">
              The premier platform built exclusively for professional traders
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-purple text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium">{feature.name}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-background" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Trusted by Professional Traders</h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Hear from our verified members
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <blockquote className="text-lg font-medium mb-4">
                    "{testimonial.content}"
                  </blockquote>
                </div>
                <footer>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </footer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to upgrade your trading network?
          </h2>
          <p className="mt-4 text-xl text-white/80 max-w-3xl mx-auto">
            Join Swift Trade today to access exclusive deals and connect with verified professional traders.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/signup">Apply for Membership</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
