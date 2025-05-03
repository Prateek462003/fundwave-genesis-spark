
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, PiggyBank, Handshake, Wallet } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 py-16 md:py-24">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            <div className="inline-block bg-purple-100 text-brand-purple px-4 py-1 rounded-full text-sm font-medium mb-6">
              Powered by Blockchain
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Crowdfund Your 
              <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent"> 
                {" "}Next Big Idea
              </span>
            </h1>
            
            <p className="text-lg text-gray-700 mb-8">
              Launch your project with the power of blockchain. Transparent fundraising, 
              no intermediaries, and complete control over your campaign.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-brand-purple hover:bg-brand-purpleDark">
                <Link to="/create">
                  Start a Campaign
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/explore">
                  Explore Projects
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <h3 className="font-bold text-xl mb-1">Featured Campaign</h3>
                <p className="text-white/80">Decentralized Art Gallery</p>
              </div>
              <div className="p-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Raised</p>
                    <p className="font-bold text-2xl">4.0 ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target</p>
                    <p className="font-bold text-2xl">10.0 ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Left</p>
                    <p className="font-bold text-2xl">30</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <Button className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purpleDark hover:to-brand-blue">
                  Back This Project
                </Button>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg transform rotate-3 hidden md:block">
              <Wallet size={24} className="text-brand-purple" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg transform -rotate-6 hidden md:block">
              <PiggyBank size={24} className="text-brand-blue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
