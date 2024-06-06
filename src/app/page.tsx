'use client';

import { ConnectButton, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";

export default function Home() {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = defineChain(2340);

  const [quantity, setQuantity] = useState<number>(1);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

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

  return (
    <main className="flex items-center justify-center min-h-[100vh]" style={{ backgroundColor: 'transparent' }}>
      <div className="relative w-[370px] h-[550px] shadow-lg rounded-lg p-4" style={{ backgroundColor: 'transparent' }}>
        <div className="absolute top-4 right-4">
          <ConnectButton
            client={client}
            chain={chain}
          />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold text-shadow-cyan">
              Total NFT Supply: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
            </p>
          )}
          <TransactionButton
            transaction={() => claimTo({
              contract: contract,
              to: account?.address || "",
              quantity: BigInt(1),  // Hardcoded to 1
            })}
            onTransactionConfirmed={async () => {
              setConfirmationMessage("NFT Claimed!");
              setQuantity(1);
            }}
            className="text-2xl px-8 py-4 mt-4 bg-blue-500 text-white rounded-lg w-full"
          >
            {`Claim NFT (${getPrice(1)} atla)`}  
          </TransactionButton>
          <div className="h-8 mt-2">  {/* Reserve space for the message */}
            {confirmationMessage && (
              <p className="text-lg font-bold" style={{ color: 'green' }}>
                {confirmationMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
