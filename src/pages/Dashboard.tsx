
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCard from "@/components/CampaignCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ethers } from "ethers";
import { PlusCircle, Wallet } from "lucide-react";

const Dashboard = () => {
  const { account, connectWallet, connecting, myCampaigns, myDonations, campaigns } = useWeb3();
  
  const donatedCampaigns = campaigns.filter(campaign => 
    myDonations.some(donation => donation.id === campaign.id)
  );
  
  const totalDonated = myDonations.reduce((total, donation) => {
    return total + parseFloat(ethers.utils.formatEther(donation.amount));
  }, 0);
  
  if (!account) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center text-center p-8">
              <Wallet size={48} className="text-brand-purple mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                You need to connect your wallet to view your dashboard
              </p>
              <Button 
                onClick={connectWallet} 
                disabled={connecting}
                className="bg-brand-purple hover:bg-brand-purpleDark"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-gray-600">
              Manage your campaigns and view your donations
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0 bg-brand-purple hover:bg-brand-purpleDark">
            <Link to="/create">
              <PlusCircle size={16} className="mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Your Campaigns</CardDescription>
              <CardTitle className="text-3xl">{myCampaigns.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Campaigns Supported</CardDescription>
              <CardTitle className="text-3xl">{donatedCampaigns.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Donated</CardDescription>
              <CardTitle className="text-3xl">{totalDonated.toFixed(2)} ETH</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="my-campaigns" className="mt-6">
          <TabsList className="mb-8">
            <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="my-donations">My Donations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-campaigns">
            {myCampaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    title={campaign.title}
                    description={campaign.description}
                    imageUrl={campaign.imageUrl}
                    targetAmount={campaign.targetAmount}
                    amountCollected={campaign.amountCollected}
                    deadline={campaign.deadline}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any campaigns yet. Start your first campaign now!
                </p>
                <Button asChild className="bg-brand-purple hover:bg-brand-purpleDark">
                  <Link to="/create">
                    <PlusCircle size={16} className="mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-donations">
            {donatedCampaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {donatedCampaigns.map((campaign) => {
                  const donation = myDonations.find(d => d.id === campaign.id);
                  const donationAmount = donation 
                    ? parseFloat(ethers.utils.formatEther(donation.amount)).toFixed(2) 
                    : "0.00";
                    
                  return (
                    <Card key={campaign.id} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={campaign.imageUrl || "https://images.unsplash.com/photo-1605792657660-596af9009e82"}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {campaign.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Your donation</p>
                            <p className="font-semibold">{donationAmount} ETH</p>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/campaign/${campaign.id}`}>
                              View Campaign
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No donations yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't donated to any campaigns yet. Explore campaigns to support!
                </p>
                <Button asChild className="bg-brand-purple hover:bg-brand-purpleDark">
                  <Link to="/explore">
                    Explore Campaigns
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
