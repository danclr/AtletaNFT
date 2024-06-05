'use client';

import { TransactionButton, useActiveAccount, useReadContract, MediaRenderer } from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState, useEffect } from "react";

export default function Home() {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);

  // Replace the chain with the chain you want to connect to
  const chain = defineChain(2340);
  const [quantity, setQuantity] = useState(1);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xE45757fc796E4F8BAcea3F3440F1056A31610770"
  });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } = useReadContract(getContractMetadata,
    { contract: contract }
  );

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract(getTotalClaimedSupply,
    { contract: contract }
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract(getActiveClaimCondition,
    { contract: contract }
  );

  useEffect(() => {
    if (!isContractMetadataLoading) {
      setLoading(false);
    }
  }, [isContractMetadataLoading]);

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  }

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center w-full" style={{ backgroundColor: 'black', color: 'white' }}>
        <div className="flex mt-4">
          <div className="w-1/3">
            {isContractMetadataLoading ? (
              <div className="rounded-xl glowing-border" style={{ paddingTop: '100%' }}>
                <span>Image Placeholder</span>
              </div>
            ) : (
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl mt-10 w-full glowing-border"
              />
            )}
          </div>
          <div className="flex flex-col items-start space-y-1 w-2/3 pl-6"> {/* Added padding-left */}
            {isContractMetadataLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-shadow">
                  {contractMetadata?.name}
                </h2>
                
              </>
            )}
            <p className="large-bold-text text-shadow">
              Public mint is: <span className="green-box">Live</span>
            </p>
            <p className="small-text text-shadow">Mint ends in:</p>
            <p className="small-text text-shadow">
              Whitelist: <span className="red-box"></span>
            </p>
            <p className="small-text text-shadow">
              Presale: <span className="red-box"></span>
            </p>
            <br />
            <p className="text-xl">
              <span className="gray-box">10 max per wallet</span>
            </p>
            <br />
            <div className="price-remaining">
              <span className="text-shadow">Price:</span>
              <span className="text-shadow">Remaining:</span>
            </div>
            <div className="price-remaining-large">
              <span className="text-shadow">5 $atla</span>
              <span className="text-shadow">{totalNFTSupply?.toString()}</span>
            </div>
            <TransactionButton
              transaction={() => claimTo({
                contract: contract,
                to: account?.address || "",
                quantity: BigInt(quantity),
              })}
              onTransactionConfirmed={async () => {
                alert("NFT Claimed!");
                setQuantity(1);
              }}
            >
              {`Claim NFT (${getPrice(quantity)} ETH)`}
            </TransactionButton>
          </div>
        </div>
      </div>
    </main>
  );
}
