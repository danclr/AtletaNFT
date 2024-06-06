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
    <main className="p-4 pb-10 min-h-[100vh] items-center absolute top-0 left-0 container max-w-screen-lg mx-auto">
      <div className="">
        <div className="">
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-4xl mt-2 font-bold">
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
              alert("NFT Claimed!");
              setQuantity(1);
            }}
            className="text-4xl px-8 py-4 mt-4 bg-blue-500 text-white rounded-lg"
          >
            {`Claim NFT (${getPrice(1)} atla)`}  
          </TransactionButton>
        </div>
      </div>
    </main>
  );
}
