
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/context/Web3Context";
import { Wallet, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { connectWallet, disconnectWallet, account, connecting } = useWeb3();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
            FundWave
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-brand-purple font-medium">
            Home
          </Link>
          <Link to="/explore" className="text-gray-700 hover:text-brand-purple font-medium">
            Explore
          </Link>
          <Link to="/create" className="text-gray-700 hover:text-brand-purple font-medium">
            Start a Campaign
          </Link>
          {account && (
            <Link to="/dashboard" className="text-gray-700 hover:text-brand-purple font-medium">
              Dashboard
            </Link>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          {!account ? (
            <Button 
              onClick={connectWallet} 
              disabled={connecting}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purpleDark hover:to-brand-blue"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gray-100 rounded-full">
                <span className="font-medium">{formatAddress(account)}</span>
              </div>
              <Button variant="outline" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-gray-700">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-brand-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className="text-gray-700 hover:text-brand-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/create" 
              className="text-gray-700 hover:text-brand-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Start a Campaign
            </Link>
            {account && (
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-brand-purple font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {!account ? (
              <Button 
                onClick={() => {
                  connectWallet();
                  setIsMenuOpen(false);
                }} 
                disabled={connecting}
                className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purpleDark hover:to-brand-blue"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className="px-4 py-2 bg-gray-100 rounded-full text-center">
                  <span className="font-medium">{formatAddress(account)}</span>
                </div>
                <Button variant="outline" onClick={disconnectWallet} className="w-full">
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
