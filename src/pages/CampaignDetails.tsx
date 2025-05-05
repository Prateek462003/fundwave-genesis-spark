import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, Users, PiggyBank } from "lucide-react";

const CampaignDetails = () => {
  const { id } = useParams();
  const campaignId = id as string; // Use the ID string directly from params
  const { campaigns, account, connectWallet, donateToCampaign, isCorrectNetwork, switchNetwork, fetchCampaigns } = useWeb3();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  
  // Update campaign data whenever campaigns change
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setLoading(true);
      try {
        // Find the campaign in the updated campaigns list
        const foundCampaign = campaigns.find(c => c.id === campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        toast({
          title: "Error",
          description: "Failed to load campaign details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (campaignId && campaigns.length > 0) {
      fetchCampaignDetails();
    }
  }, [campaignId, campaigns, toast]);
  
  const handleDonate = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to donate.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to the Sepolia testnet to donate.",
      });
      await switchNetwork();
      return;
    }
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    try {
      const success = await donateToCampaign(campaignId, donationAmount);
      if (success) {
        setDonationAmount("");
        // Refresh campaign details to show updated donation amount
        await fetchCampaigns();
      }
    } catch (error) {
      console.error("Error donating:", error);
      toast({
        title: "Error",
        description: "Failed to complete donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/explore">
              <ArrowLeft size={16} className="mr-2" />
              Back to Explore
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Calculate funding percentage
  const targetEth = parseFloat(ethers.utils.formatEther(campaign.targetAmount));
  const collectedEth = parseFloat(ethers.utils.formatEther(campaign.amountCollected));
  const percentageFunded = (collectedEth / targetEth) * 100;
  
  // Calculate days left
  const daysLeft = Math.max(0, Math.floor((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24)));
  const isActive = campaign.deadline > Date.now();
  
  // Format creator address
  const formattedCreator = `${campaign.creator.substring(0, 6)}...${campaign.creator.substring(campaign.creator.length - 4)}`;
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/explore">
            <ArrowLeft size={16} className="mr-2" />
            Back to Explore
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden mb-6">
              <img 
                src={campaign.imageUrl || "https://images.unsplash.com/photo-1605792657660-596af9009e82"} 
                alt={campaign.title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
            
            <div className="mb-6 flex items-center space-x-4">
              <div className="px-4 py-2 bg-purple-50 rounded-full text-sm text-brand-purple font-medium">
                Created by: {formattedCreator}
              </div>
              
              {isActive ? (
                <div className="px-4 py-2 bg-green-50 rounded-full text-sm text-green-600 font-medium flex items-center">
                  <Clock size={14} className="mr-1" />
                  Active
                </div>
              ) : (
                <div className="px-4 py-2 bg-orange-50 rounded-full text-sm text-orange-600 font-medium flex items-center">
                  <Clock size={14} className="mr-1" />
                  Ended
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">About this campaign</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {campaign.description}
              </p>
            </div>
          </div>
          
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Funded</span>
                    <span className="font-medium">{percentageFunded.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentageFunded} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Raised</p>
                    <p className="text-2xl font-semibold">{collectedEth.toFixed(2)} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target</p>
                    <p className="text-2xl font-semibold">{targetEth.toFixed(2)} ETH</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2.5 rounded-full mr-3">
                    <Clock size={20} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-medium">{daysLeft} days left</p>
                    <p className="text-sm text-gray-600">
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <>
                    <Separator />
                    
                    <div>
                      <p className="font-medium mb-2">Support this campaign</p>
                      <div className="flex items-center space-x-4 mb-3">
                        <Input 
                          type="number"
                          placeholder="ETH Amount" 
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="flex-grow"
                        />
                      </div>
                      
                      {account ? (
                        <Button 
                          className="w-full bg-brand-purple hover:bg-brand-purpleDark"
                          onClick={handleDonate}
                          disabled={processing}
                        >
                          {processing ? "Processing..." : "Donate"}
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-brand-purple hover:bg-brand-purpleDark"
                          onClick={connectWallet}
                        >
                          Connect Wallet to Donate
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CampaignDetails;
