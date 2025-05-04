
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ABI for our smart contract (simplified version for demo)
const crowdfundingAbi = [
  "function createCampaign(string memory title, string memory description, uint256 targetAmount, uint256 deadline) external",
  "function getCampaignCount() external view returns (uint256)",
  "function getCampaign(uint256 _id) external view returns (address creator, string memory title, string memory description, uint256 targetAmount, uint256 amountCollected, uint256 deadline, bool claimed)",
  "function donateToCampaign(uint256 _id) external payable",
  "function getMyDonations() external view returns (uint256[] memory ids, uint256[] memory amounts)",
  "function withdrawFunds(uint256 _id) external"
];

interface Campaign {
  id: string;
  creator: string;
  title: string;
  description: string;
  targetAmount: string;
  amountCollected: string;
  deadline: number;
  claimed: boolean;
  imageUrl?: string;
}

interface Web3ContextType {
  account: string | null;
  connecting: boolean;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  campaigns: Campaign[];
  loadingCampaigns: boolean;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (title: string, description: string, target: string, deadline: number, imageUrl: string) => Promise<boolean>;
  donateToCampaign: (id: string, amount: string) => Promise<boolean>;
  myDonations: { id: string, amount: string }[];
  myCampaigns: Campaign[];
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
}

// For demo purposes - using Sepolia testnet
const NETWORK_ID = 11155111;
// Replace with actual contract address when available
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; 

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [myDonations, setMyDonations] = useState<{ id: string; amount: string }[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  
  const { toast } = useToast();

  const initWeb3Modal = () => {
    return new Web3Modal({
      network: "sepolia",
      cacheProvider: true,
      providerOptions: {}
    });
  };

  const connectWallet = async () => {
    try {
      setConnecting(true);
      const web3Modal = initWeb3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setAccount(address);
      setIsCorrectNetwork(network.chainId === NETWORK_ID);
      
      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, crowdfundingAbi, signer);
      setContract(contract);
      
      // Set the current wallet address in Supabase session
      if (address) {
        await supabase.rpc('set_current_wallet_address', { address });
      }
      
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully.",
      });

      // Load user campaigns and donations
      fetchCampaigns();
      
      // Listen for account changes
      window.ethereum?.on("accountsChanged", handleAccountChange);
      window.ethereum?.on("chainChanged", handleChainChange);

    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setMyCampaigns([]);
    setMyDonations([]);
    
    const web3Modal = initWeb3Modal();
    web3Modal.clearCachedProvider();
    
    // Remove listeners
    window.ethereum?.removeListener("accountsChanged", handleAccountChange);
    window.ethereum?.removeListener("chainChanged", handleChainChange);
    
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const handleAccountChange = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      // Update the current wallet address in Supabase session
      if (accounts[0]) {
        supabase.rpc('set_current_wallet_address', { address: accounts[0] })
          .then(() => {
            // Refresh campaigns and donations when account changes
            fetchCampaigns();
          });
      }
    } else {
      disconnectWallet();
    }
  };

  const handleChainChange = () => {
    window.location.reload();
  };

  const switchNetwork = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to switch networks.",
        variant: "destructive",
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NETWORK_ID.toString(16)}` }]
      });
    } catch (error: any) {
      console.error("Error switching network:", error);
      toast({
        title: "Network Switch Failed",
        description: error.message || "Could not switch networks. Please try manually.",
        variant: "destructive",
      });
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      
      // Fetch all campaigns from Supabase
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*');
      
      if (campaignsError) {
        throw campaignsError;
      }
      
      if (campaignsData) {
        const formattedCampaigns: Campaign[] = campaignsData.map(campaign => ({
          id: campaign.id,
          creator: campaign.creator_address,
          title: campaign.title,
          description: campaign.description,
          targetAmount: campaign.target_amount,
          amountCollected: campaign.amount_collected || '0',
          deadline: campaign.deadline,
          claimed: campaign.claimed || false,
          imageUrl: campaign.image_url
        }));
        
        setCampaigns(formattedCampaigns);
        
        // If account is connected, filter my campaigns
        if (account) {
          const myCampaignsData = formattedCampaigns.filter(
            campaign => campaign.creator.toLowerCase() === account.toLowerCase()
          );
          setMyCampaigns(myCampaignsData);
          
          // Fetch my donations
          const { data: donationsData, error: donationsError } = await supabase
            .from('donations')
            .select('*')
            .eq('donor_address', account);
            
          if (donationsError) {
            throw donationsError;
          }
          
          if (donationsData) {
            const myDonationsFormatted = donationsData.map(donation => ({
              id: donation.campaign_id,
              amount: donation.amount
            }));
            setMyDonations(myDonationsFormatted);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const createCampaign = async (
    title: string, 
    description: string, 
    target: string, 
    deadline: number,
    imageUrl: string
  ): Promise<boolean> => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to the Sepolia testnet.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // For demo/testing - directly trigger a wallet transaction
      // This will open the wallet popup even without a real contract
      const signer = provider!.getSigner();
      
      toast({
        title: "Creating Campaign",
        description: "Please confirm the transaction in your wallet.",
      });
      
      // Fixed transaction format - don't send data to self
      // Instead, send it to a burn address with 0 ETH
      const burnAddress = "0x000000000000000000000000000000000000dEaD";
      await signer.sendTransaction({
        to: burnAddress,
        value: ethers.utils.parseEther("0"),
      });
      
      // Once the transaction is approved, create campaign in Supabase
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert([
          {
            creator_address: account,
            title,
            description,
            target_amount: ethers.utils.parseEther(target).toString(),
            deadline,
            image_url: imageUrl
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Refresh campaigns list
      fetchCampaigns();
      
      toast({
        title: "Success!",
        description: "Your campaign has been created successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const donateToCampaign = async (id: string, amount: string): Promise<boolean> => {
    if (!account) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to the Sepolia testnet.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const signer = provider!.getSigner();
      const ethAmount = ethers.utils.parseEther(amount);
      
      toast({
        title: "Processing Donation",
        description: "Please confirm the transaction in your wallet.",
      });
      
      // To simulate a donation but actually use test ETH, we'll send to a burn address
      const burnAddress = "0x000000000000000000000000000000000000dEaD";
      
      // Send the transaction with real ETH value
      await signer.sendTransaction({
        to: burnAddress,
        value: ethAmount,
      });
      
      // Get current amount collected
      const { data: campaignData, error: fetchError } = await supabase
        .from('campaigns')
        .select('amount_collected')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Update campaign amount collected
      const currentAmount = ethers.BigNumber.from(campaignData.amount_collected || '0');
      const newAmount = currentAmount.add(ethAmount).toString();
      
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ amount_collected: newAmount })
        .eq('id', id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Record the donation
      const { error: donationError } = await supabase
        .from('donations')
        .insert([
          {
            donor_address: account,
            campaign_id: id,
            amount: ethAmount.toString()
          }
        ]);
      
      if (donationError) {
        throw donationError;
      }
      
      // Refresh campaigns and donations
      fetchCampaigns();
      
      toast({
        title: "Success!",
        description: `You have donated ${amount} ETH to this campaign.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error donating:", error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check connection on initial load (if cached)
  useEffect(() => {
    const web3Modal = initWeb3Modal();
    if (web3Modal.cachedProvider) {
      connectWallet();
    } else {
      // Fetch campaigns even if not connected
      fetchCampaigns();
    }
  }, []);

  // Actual value to be provided
  const contextValue: Web3ContextType = {
    account,
    connecting,
    connected: !!account,
    connectWallet,
    disconnectWallet,
    campaigns,
    loadingCampaigns,
    fetchCampaigns,
    createCampaign,
    donateToCampaign,
    myDonations,
    myCampaigns,
    isCorrectNetwork,
    switchNetwork
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
