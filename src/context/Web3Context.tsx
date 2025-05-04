
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useToast } from '@/components/ui/use-toast';

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
  id: number;
  creator: string;
  title: string;
  description: string;
  targetAmount: string;
  amountCollected: string;
  deadline: number;
  claimed: boolean;
  imageUrl?: string; // For UI purposes
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
  donateToCampaign: (id: number, amount: string) => Promise<boolean>;
  myDonations: { id: number, amount: string }[];
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
  const [myDonations, setMyDonations] = useState<{ id: number; amount: string }[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  
  const { toast } = useToast();

  // Mock campaigns for the demo
  const mockCampaigns: Campaign[] = [
    {
      id: 1,
      creator: '0xabcd...1234',
      title: 'Decentralized Art Gallery',
      description: 'Creating a platform for artists to showcase and sell their digital art as NFTs without high marketplace fees.',
      targetAmount: ethers.utils.parseEther('10').toString(),
      amountCollected: ethers.utils.parseEther('4').toString(),
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      claimed: false,
      imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912'
    },
    {
      id: 2,
      creator: '0xefgh...5678',
      title: 'Community Solar Project',
      description: 'Funding a community-owned solar farm that will provide clean energy and share profits with token holders.',
      targetAmount: ethers.utils.parseEther('50').toString(),
      amountCollected: ethers.utils.parseEther('25').toString(),
      deadline: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
      claimed: false,
      imageUrl: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a'
    },
    {
      id: 3,
      creator: '0xijkl...9012',
      title: 'Blockchain Game Development',
      description: 'Building an open-world RPG with blockchain integration for true ownership of in-game assets.',
      targetAmount: ethers.utils.parseEther('30').toString(),
      amountCollected: ethers.utils.parseEther('10').toString(),
      deadline: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days from now
      claimed: false,
      imageUrl: 'https://images.unsplash.com/photo-1556438064-2d7646166914'
    }
  ];

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
      
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully.",
      });

      // For demo purposes, we'll set mock data
      setCampaigns(mockCampaigns);
      setMyDonations([{ id: 1, amount: ethers.utils.parseEther('2').toString() }]);
      setMyCampaigns([mockCampaigns[0]]);
      
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
    if (!contract) return;
    
    try {
      setLoadingCampaigns(true);
      
      // In a real implementation, we'd fetch from blockchain
      // For demo, we'll use our mock data
      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoadingCampaigns(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setLoadingCampaigns(false);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const createCampaign = async (
    title: string, 
    description: string, 
    target: string, 
    deadline: number,
    imageUrl: string
  ): Promise<boolean> => {
    if (!provider || !account) {
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
      const signer = provider.getSigner();
      
      toast({
        title: "Creating Campaign",
        description: "Please confirm the transaction in your wallet.",
      });
      
      // Instead of calling a real contract, we'll create a dummy transaction
      // that will make MetaMask open but won't be sent to the network
      await signer.sendTransaction({
        to: account, // Sending to self
        value: ethers.utils.parseEther("0"),
        data: ethers.utils.toUtf8Bytes(`Create Campaign: ${title}`),
      });
      
      // Once the transaction is approved, we add to our mock campaigns
      const newCampaign: Campaign = {
        id: campaigns.length + 1,
        creator: account,
        title,
        description,
        targetAmount: ethers.utils.parseEther(target).toString(),
        amountCollected: "0",
        deadline,
        claimed: false,
        imageUrl
      };
      
      setCampaigns([...campaigns, newCampaign]);
      setMyCampaigns([...myCampaigns, newCampaign]);
      
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

  const donateToCampaign = async (id: number, amount: string): Promise<boolean> => {
    if (!provider || !account) {
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
      const signer = provider.getSigner();
      
      toast({
        title: "Processing Donation",
        description: "Please confirm the transaction in your wallet.",
      });
      
      // For demo purposes, create a real transaction that opens the wallet
      // Instead of sending to the contract, we'll just send a 0 ETH transaction with data
      await signer.sendTransaction({
        to: account, // Sending to self
        value: ethers.utils.parseEther("0"), 
        data: ethers.utils.toUtf8Bytes(`Donate to Campaign #${id}: ${amount} ETH`),
      });
      
      // Update our mock campaigns
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.id === id) {
          const currentAmount = ethers.BigNumber.from(campaign.amountCollected);
          const donationAmount = ethers.utils.parseEther(amount);
          return {
            ...campaign,
            amountCollected: currentAmount.add(donationAmount).toString()
          };
        }
        return campaign;
      });
      
      setCampaigns(updatedCampaigns);
      
      // Update donations
      const existingDonation = myDonations.find(d => d.id === id);
      if (existingDonation) {
        const updatedDonations = myDonations.map(d => {
          if (d.id === id) {
            const currentAmount = ethers.BigNumber.from(d.amount);
            const donationAmount = ethers.utils.parseEther(amount);
            return {
              ...d,
              amount: currentAmount.add(donationAmount).toString()
            };
          }
          return d;
        });
        setMyDonations(updatedDonations);
      } else {
        setMyDonations([...myDonations, { id, amount: ethers.utils.parseEther(amount).toString() }]);
      }
      
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
      // For demo purposes, we'll load mock campaigns even if not connected
      setCampaigns(mockCampaigns);
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
