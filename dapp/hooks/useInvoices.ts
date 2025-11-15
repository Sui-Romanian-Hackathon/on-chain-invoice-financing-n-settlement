"use client";

import { useWalletKit } from "@mysten/wallet-kit";
import { SuiClient } from "@mysten/sui.js/client";
import { useQuery } from "@tanstack/react-query";
import {
  OnChainInvoice,
  formatSuiAmount,
  InvoiceFilters,
  InvoiceStatus,
} from "@/types/invoice";

export function useInvoices(filters?: InvoiceFilters) {
  const { currentAccount } = useWalletKit();
  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";

  const suiClient = new SuiClient({
    url:
      network === "mainnet"
        ? "https://fullnode.mainnet.sui.io:443"
        : "https://fullnode.testnet.sui.io:443",
  });

  const fetchInvoices = async (): Promise<OnChainInvoice[]> => {
    if (!packageId) {
      console.warn("Package ID not configured");
      return [];
    }

    console.group("🔍 Fetching Invoices from Blockchain");
    console.log("Package ID:", packageId);
    console.log("Network:", network);

    try {
      // Get all Invoice objects owned by anyone
      // We need to query by object type
      const invoiceType = `${packageId}::invoice_financing::Invoice`;
      console.log("Querying for type:", invoiceType);

      // Query for all objects of type Invoice
      // Note: This is a simplified approach. In production, you'd want to:
      // 1. Use events to build an index
      // 2. Use a backend indexer
      // 3. Or query owned objects + shared objects

      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::invoice_financing::InvoiceCreated`,
        },
        limit: 50, // Adjust as needed
        order: "descending",
      });

      console.log("Events found:", events.data.length);

      // Extract invoice IDs from events
      const invoiceIds = events.data
        .map((event) => {
          const parsedJson = event.parsedJson as any;
          return parsedJson?.invoice_id;
        })
        .filter(Boolean);

      console.log("Invoice IDs:", invoiceIds);

      // Fetch each invoice object
      const invoiceObjects = await Promise.all(
        invoiceIds.map(async (id) => {
          try {
            const obj = await suiClient.getObject({
              id: id,
              options: {
                showContent: true,
                showOwner: true,
              },
            });
            return obj;
          } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            return null;
          }
        })
      );

      console.log("Fetched objects:", invoiceObjects.length);

      // Parse invoice data
      const invoices: OnChainInvoice[] = invoiceObjects
        .filter(
          (obj): obj is NonNullable<typeof obj> =>
            obj !== null && obj.data?.content !== undefined
        )
        .map((obj) => {
          const content = obj.data!.content as any;
          const fields = content.fields;

          const invoice: OnChainInvoice = {
            id: obj.data!.objectId,
            invoiceNumber: Buffer.from(fields.invoice_number).toString("utf-8"),
            issuer: fields.issuer,
            buyer: Buffer.from(fields.buyer).toString("utf-8"),
            amount: fields.amount,
            amountInSui: formatSuiAmount(fields.amount),
            dueDate: parseInt(fields.due_date),
            description: Buffer.from(fields.description).toString("utf-8"),
            createdAt: parseInt(fields.created_at),
            status: parseInt(fields.status),
            financedBy: fields.financed_by ? fields.financed_by : undefined,
            financedAmount: fields.financed_amount || "0",
            financedAmountInSui: formatSuiAmount(fields.financed_amount || "0"),
          };

          return invoice;
        });

      console.log("Parsed invoices:", invoices.length);
      console.log("Sample invoice:", invoices[0]);

      // Apply filters
      let filteredInvoices = invoices;

      if (filters?.status && filters.status !== "all") {
        const statusMap = {
          pending: InvoiceStatus.PENDING,
          funded: InvoiceStatus.FUNDED,
          repaid: InvoiceStatus.REPAID,
        };
        filteredInvoices = filteredInvoices.filter(
          (inv) =>
            inv.status === statusMap[filters.status as keyof typeof statusMap]
        );
      }

      if (filters?.minAmount) {
        filteredInvoices = filteredInvoices.filter(
          (inv) => inv.amountInSui >= filters.minAmount!
        );
      }

      if (filters?.maxAmount) {
        filteredInvoices = filteredInvoices.filter(
          (inv) => inv.amountInSui <= filters.maxAmount!
        );
      }

      // Apply sorting
      if (filters?.sortBy) {
        filteredInvoices.sort((a, b) => {
          let aVal: number, bVal: number;

          switch (filters.sortBy) {
            case "amount":
              aVal = a.amountInSui;
              bVal = b.amountInSui;
              break;
            case "dueDate":
              aVal = a.dueDate;
              bVal = b.dueDate;
              break;
            case "createdAt":
              aVal = a.createdAt;
              bVal = b.createdAt;
              break;
            default:
              return 0;
          }

          const order = filters.sortOrder === "desc" ? -1 : 1;
          return (aVal - bVal) * order;
        });
      }

      console.log("Filtered invoices:", filteredInvoices.length);
      console.groupEnd();

      return filteredInvoices;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      console.groupEnd();
      throw error;
    }
  };

  return useQuery({
    queryKey: ["invoices", packageId, filters],
    queryFn: fetchInvoices,
    enabled: !!packageId,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

// Hook to fetch a single invoice
export function useInvoice(invoiceId: string) {
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";

  const suiClient = new SuiClient({
    url:
      network === "mainnet"
        ? "https://fullnode.mainnet.sui.io:443"
        : "https://fullnode.testnet.sui.io:443",
  });

  const fetchInvoice = async (): Promise<OnChainInvoice | null> => {
    if (!invoiceId) return null;

    try {
      const obj = await suiClient.getObject({
        id: invoiceId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!obj.data?.content) return null;

      const content = obj.data.content as any;
      const fields = content.fields;

      return {
        id: obj.data.objectId,
        invoiceNumber: Buffer.from(fields.invoice_number).toString("utf-8"),
        issuer: fields.issuer,
        buyer: Buffer.from(fields.buyer).toString("utf-8"),
        amount: fields.amount,
        amountInSui: formatSuiAmount(fields.amount),
        dueDate: parseInt(fields.due_date),
        description: Buffer.from(fields.description).toString("utf-8"),
        createdAt: parseInt(fields.created_at),
        status: parseInt(fields.status),
        financedBy: fields.financed_by,
        financedAmount: fields.financed_amount || "0",
        financedAmountInSui: formatSuiAmount(fields.financed_amount || "0"),
      };
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return null;
    }
  };

  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: fetchInvoice,
    enabled: !!invoiceId,
  });
}

// Hook to fetch user's invoices (created by them)
export function useMyInvoices() {
  const { currentAccount } = useWalletKit();
  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";

  const suiClient = new SuiClient({
    url:
      network === "mainnet"
        ? "https://fullnode.mainnet.sui.io:443"
        : "https://fullnode.testnet.sui.io:443",
  });

  const fetchMyInvoices = async (): Promise<OnChainInvoice[]> => {
    if (!currentAccount || !packageId) return [];

    try {
      // Get objects owned by current user
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${packageId}::invoice_financing::Invoice`,
        },
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      const invoices = ownedObjects.data
        .filter((obj) => obj.data?.content)
        .map((obj) => {
          const content = obj.data!.content as any;
          const fields = content.fields;

          return {
            id: obj.data!.objectId,
            invoiceNumber: Buffer.from(fields.invoice_number).toString("utf-8"),
            issuer: fields.issuer,
            buyer: Buffer.from(fields.buyer).toString("utf-8"),
            amount: fields.amount,
            amountInSui: formatSuiAmount(fields.amount),
            dueDate: parseInt(fields.due_date),
            description: Buffer.from(fields.description).toString("utf-8"),
            createdAt: parseInt(fields.created_at),
            status: parseInt(fields.status),
            financedBy: fields.financed_by,
            financedAmount: fields.financed_amount || "0",
            financedAmountInSui: formatSuiAmount(fields.financed_amount || "0"),
          };
        });

      return invoices;
    } catch (error) {
      console.error("Error fetching my invoices:", error);
      return [];
    }
  };

  return useQuery({
    queryKey: ["my-invoices", currentAccount?.address, packageId],
    queryFn: fetchMyInvoices,
    enabled: !!currentAccount && !!packageId,
    refetchInterval: 10000,
  });
}

// Hook to fetch invoices financed by current user (investor/financier)
export function useFinancedInvoices() {
  const { currentAccount } = useWalletKit();
  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";

  const suiClient = new SuiClient({
    url:
      network === "mainnet"
        ? "https://fullnode.mainnet.sui.io:443"
        : "https://fullnode.testnet.sui.io:443",
  });

  const fetchFinancedInvoices = async (): Promise<OnChainInvoice[]> => {
    if (!currentAccount || !packageId) return [];

    console.group("🔍 Fetching Financed Invoices for Investor");
    console.log("Investor Address:", currentAccount.address);
    console.log("Package ID:", packageId);

    try {
      // Query all InvoiceCreated events
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${packageId}::invoice_financing::InvoiceCreated`,
        },
        limit: 50,
        order: "descending",
      });

      console.log("Total invoice events found:", events.data.length);

      // Extract invoice IDs from events
      const invoiceIds = events.data
        .map((event) => {
          const parsedJson = event.parsedJson as any;
          return parsedJson?.invoice_id;
        })
        .filter(Boolean);

      // Fetch each invoice object and filter by financier
      const invoiceObjects = await Promise.all(
        invoiceIds.map(async (id) => {
          try {
            const obj = await suiClient.getObject({
              id: id,
              options: {
                showContent: true,
                showOwner: true,
              },
            });
            return obj;
          } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error);
            return null;
          }
        })
      );

      // Parse and filter invoices where current user is the financier
      const financedInvoices: OnChainInvoice[] = invoiceObjects
        .filter(
          (obj): obj is NonNullable<typeof obj> =>
            obj !== null && obj.data?.content !== undefined
        )
        .map((obj) => {
          const content = obj.data!.content as any;
          const fields = content.fields;

          return {
            id: obj.data!.objectId,
            invoiceNumber: Buffer.from(fields.invoice_number).toString("utf-8"),
            issuer: fields.issuer,
            buyer: Buffer.from(fields.buyer).toString("utf-8"),
            amount: fields.amount,
            amountInSui: formatSuiAmount(fields.amount),
            dueDate: parseInt(fields.due_date),
            description: Buffer.from(fields.description).toString("utf-8"),
            createdAt: parseInt(fields.created_at),
            status: parseInt(fields.status),
            financedBy: fields.financed_by,
            financedAmount: fields.financed_amount || "0",
            financedAmountInSui: formatSuiAmount(fields.financed_amount || "0"),
          };
        })
        .filter((invoice) => {
          // Only include invoices financed by current user
          return invoice.financedBy === currentAccount.address;
        });

      console.log("Invoices financed by user:", financedInvoices.length);
      console.groupEnd();

      return financedInvoices;
    } catch (error) {
      console.error("Error fetching financed invoices:", error);
      console.groupEnd();
      return [];
    }
  };

  return useQuery({
    queryKey: ["financed-invoices", currentAccount?.address, packageId],
    queryFn: fetchFinancedInvoices,
    enabled: !!currentAccount && !!packageId,
    refetchInterval: 10000,
  });
}
