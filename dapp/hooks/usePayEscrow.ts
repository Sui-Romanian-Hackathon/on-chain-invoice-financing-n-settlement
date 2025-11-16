"use client";

import { useWalletKit } from "@mysten/wallet-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function usePayEscrow() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

  const packageId = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";

  const suiClient = new SuiClient({
    url:
      network === "mainnet"
        ? "https://fullnode.mainnet.sui.io:443"
        : "https://fullnode.testnet.sui.io:443",
  });

  const payEscrow = async (invoiceId: string, escrowObjectId: string, escrowAmount: number) => {
    console.group("💰 Paying Escrow");
    console.log("Invoice ID:", invoiceId);
    console.log("Escrow Object ID:", escrowObjectId);
    console.log("Escrow Amount:", escrowAmount, "SUI");

    if (!currentAccount) {
      console.error("❌ Wallet not connected");
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      console.groupEnd();
      return null;
    }

    if (!packageId) {
      console.error("❌ Package ID not configured");
      toast({
        title: "Configuration Error",
        description: "Package ID not configured.",
        variant: "destructive",
      });
      console.groupEnd();
      return null;
    }

    setIsLoading(true);

    try {
      console.log("🔄 Building transaction block...");
      console.log("📦 Package ID:", packageId);

      const txb = new TransactionBlock();

      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const escrowAmountInMist = Math.floor(escrowAmount * 1_000_000_000);
      console.log("Escrow amount in MIST:", escrowAmountInMist);

      // Split coin for escrow payment
      const [paymentCoin] = txb.splitCoins(txb.gas, [
        txb.pure(escrowAmountInMist),
      ]);

      // Call pay_escrow function
      const moveCallTarget = `${packageId}::escrow::pay_escrow` as `${string}::${string}::${string}`;
      console.log("🎯 Move Call Target:", moveCallTarget);

      txb.moveCall({
        target: moveCallTarget,
        arguments: [
          txb.object(invoiceId), // invoice: &mut Invoice
          txb.object(escrowObjectId), // buyer_escrow: &mut BuyerEscrow
          paymentCoin, // payment: Coin<SUI>
        ],
      });

      console.log("✅ Transaction block built successfully");
      console.log("📤 Sending escrow payment transaction...");

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb as any,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log("✅ Escrow paid successfully!");
      console.log("📊 Transaction Result:", result);

      toast({
        title: "Escrow Paid Successfully! 🎉",
        description: `You've paid ${escrowAmount.toFixed(2)} SUI escrow. Invoice is now available for financing.`,
      });

      console.groupEnd();
      setIsLoading(false);

      return {
        success: true,
        digest: result.digest,
      };
    } catch (error: any) {
      console.group("❌ Escrow Payment Error");
      console.error("Error object:", error);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to pay escrow. Check console for details.";

      if (error.message?.includes("Insufficient")) {
        errorMessage = "Insufficient SUI balance to pay escrow.";
      } else if (error.message?.includes("E_NOT_BUYER")) {
        errorMessage = "Only the buyer can pay escrow for this invoice.";
      } else if (error.message?.includes("E_INVALID_PAYMENT_AMOUNT")) {
        errorMessage = "Payment amount doesn't match the required escrow amount.";
      } else if (error.message?.includes("E_WRONG_INVOICE")) {
        errorMessage = "Escrow object doesn't match this invoice.";
      }

      toast({
        title: "Escrow Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.groupEnd();
      setIsLoading(false);
      return null;
    }
  };

  // Function to find the escrow object for an invoice
  const findEscrowObject = async (invoiceId: string): Promise<string | null> => {
    if (!packageId) return null;

    try {
      console.log("🔍 Finding escrow object for invoice:", invoiceId);

      // Query for BuyerEscrow objects
      // We need to find the escrow that matches this invoice_id
      const escrowType = `${packageId}::escrow::BuyerEscrow`;

      // Get all BuyerEscrow objects (they are shared objects)
      // We'll need to query events to find the right one
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::invoice_factory::InvoiceCreated`,
        },
        limit: 100,
        order: "descending",
      });

      // Find the event for this invoice
      const invoiceEvent = events.data.find((event) => {
        const parsedJson = event.parsedJson as any;
        return parsedJson?.invoice_id === invoiceId;
      });

      if (!invoiceEvent) {
        console.warn("⚠️ Invoice event not found");
        return null;
      }

      // The escrow object is created in the same transaction as the invoice
      // We need to get the transaction details to find the escrow object ID
      const txDigest = invoiceEvent.id.txDigest;
      console.log("Transaction digest:", txDigest);

      const txDetails = await suiClient.getTransactionBlock({
        digest: txDigest,
        options: {
          showObjectChanges: true,
        },
      });

      // Find the BuyerEscrow object in the transaction's created objects
      const escrowObject = txDetails.objectChanges?.find(
        (change: any) =>
          change.type === "created" &&
          change.objectType?.includes("BuyerEscrow")
      );

      if (escrowObject && "objectId" in escrowObject) {
        const escrowId = (escrowObject as any).objectId;
        console.log("✅ Found escrow object:", escrowId);
        return escrowId;
      }

      console.warn("⚠️ Escrow object not found in transaction");
      return null;
    } catch (error) {
      console.error("Error finding escrow object:", error);
      return null;
    }
  };

  return {
    payEscrow,
    findEscrowObject,
    isLoading,
    isConnected: !!currentAccount,
  };
}
