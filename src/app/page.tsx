'use client';

import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState, useEffect } from "react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletChain, setWalletChain] = useState<string | null>(null);

  // Replace the chain with the chain you want to connect to
  const chain = defineChain(2340);

  const [quantity, setQuantity] = useState<number>(1);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xE45757fc796E4F8BAcea3F3440F1056A31610770"
  });

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract(getTotalClaimedSupply,
    { contract: contract }
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract(getActiveClaimCondition,
    { contract: contract }
  );

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0", 10);
    return toEther(BigInt(total));
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'walletConnected') {
        setWalletAddress(event.data.account);
        setWalletChain(event.data.chainId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const connectWallet = () => {
    window.parent.postMessage('connectWallet', '*');
  };

  return (
    <main className="flex items-center justify-center min-h-[100vh]" style={{ backgroundColor: 'transparent' }}>
      <div className="relative w-[670px] h-[770px] shadow-lg rounded-lg p-4" style={{ backgroundColor: 'transparent' }}>
        <div className="absolute top-4 right-4">
          {walletAddress ? (
            <div>
              <p className="text-white" style={{ textShadow: "0 0 10px cyan" }}>
                User Balance: {walletAddress}
              </p>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              style={{
                backgroundColor: "rgba(0, 255, 255, 0.1)", // Transparent background with low opacity
                color: "#00FFFF", // Cyan text color
                border: "2px solid #00FFFF", // Cyan border
                borderRadius: "5px", // Less rounded corners
                padding: "10px 20px", // Padding
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "auto", // Auto width
                boxSizing: "border-box",
                cursor: "pointer",
                fontFamily: "Orbitron, sans-serif",
                fontWeight: "bold",
                fontSize: "24px",
                transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
              }}
            >
              Log In
            </button>
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold text-shadow-cyan">
              Minted: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
            </p>
          )}
          <TransactionButton 
            unstyled
            className="custom-button"
            transaction={() => claimTo({
              contract: contract,
              to: walletAddress || "",
              quantity: BigInt(1),  // Hardcoded to 1
            })}
            onTransactionConfirmed={async (receipt) => {
              setConfirmationMessage("NFT Claimed!");
              setTransactionHash(receipt.transactionHash);
              setQuantity(1);
            }}
          >
            {`CLAIM NFT (${getPrice(1)} )`}  
          </TransactionButton>
          <div className="h-8 mt-2">  {/* Reserve space for the message */}
            {confirmationMessage && (
              <p className="text-lg font-bold" style={{ color: 'green' }}>
                {confirmationMessage}
                {transactionHash && (
                  <a
                    href={`https://blockscout.atleta.network/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline text-blue-500"
                  >
                    View Transaction
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
