"use client";

import { useEffect, useState, useMemo } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import Navigation from "@/components/Navigation";
import InvestorDashboardHeader from "@/components/InvestorDashboardHeader";
import PortfolioStatsCards, { PortfolioStats } from "@/components/PortfolioStatsCards";
import InvestmentList from "@/components/InvestmentList";
import PortfolioDistribution from "@/components/PortfolioDistribution";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { Investment } from "@/components/InvestmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { useFinancedInvoices } from "@/hooks/useInvoices";
import { OnChainInvoice, InvoiceStatus, formatDate } from "@/types/invoice";

const InvestorDashboard = () => {
  const { currentAccount } = useWalletKit();
  const { data: financedInvoices, isLoading, error } = useFinancedInvoices();
  const [kycStatus, setKycStatus] = useState<'approved' | 'pending' | 'rejected' | 'loading'>('loading');

  // Fetch KYC status when wallet connects
  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (!currentAccount?.address) {
        setKycStatus('loading');
        return;
      }

      try {
        const response = await fetch(`/api/kyc/status/${currentAccount.address}`);
        if (response.ok) {
          const data = await response.json();
          setKycStatus(data.status);
        } else {
          // Auto-submit KYC if not found (MVP behavior)
          const submitResponse = await fetch('/api/kyc/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: currentAccount.address }),
          });
          if (submitResponse.ok) {
            const data = await submitResponse.json();
            setKycStatus(data.status);
          }
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
        setKycStatus('pending');
      }
    };

    fetchKYCStatus();
  }, [currentAccount?.address]);

  // Convert blockchain invoices to Investment format
  const convertToInvestment = (invoice: OnChainInvoice): Investment => {
    const isSettled = invoice.status === InvoiceStatus.REPAID;
    const invested = invoice.financedAmountInSui;
    const expectedReturn = invoice.amountInSui;
    const returnAmount = expectedReturn - invested;
    const returnRate = invested > 0 ? ((returnAmount / invested) * 100) : 0;

    // Calculate days between financing and due date for annualized return
    const now = Date.now();
    const dueTimestamp = invoice.dueDate * 1000;
    const daysToMaturity = Math.max(1, Math.ceil((dueTimestamp - now) / (1000 * 60 * 60 * 24)));

    return {
      id: invoice.id,
      business: invoice.issuer.substring(0, 10) + "...",
      invoiceId: invoice.invoiceNumber,
      invested: invested,
      expectedReturn: isSettled ? undefined : expectedReturn,
      actualReturn: isSettled ? expectedReturn : undefined,
      returnRate: parseFloat(returnRate.toFixed(2)),
      dueDate: isSettled ? undefined : formatDate(invoice.dueDate),
      settledDate: isSettled ? formatDate(invoice.dueDate) : undefined,
      rating: "A", // Mock rating for MVP
      status: isSettled ? "settled" : "active",
    };
  };

  // Split into active and settled investments
  const { activeInvestments, settledInvestments } = useMemo(() => {
    if (!financedInvoices) {
      return { activeInvestments: [], settledInvestments: [] };
    }

    const active: Investment[] = [];
    const settled: Investment[] = [];

    financedInvoices.forEach((invoice) => {
      const investment = convertToInvestment(invoice);
      if (investment.status === "active") {
        active.push(investment);
      } else {
        settled.push(investment);
      }
    });

    return { activeInvestments: active, settledInvestments: settled };
  }, [financedInvoices]);

  // Calculate portfolio statistics
  const portfolioStats: PortfolioStats = useMemo(() => {
    if (!financedInvoices || financedInvoices.length === 0) {
      return {
        totalInvested: "$0",
        totalInvestments: 0,
        totalReturns: "$0",
        avgReturn: "0% average return",
        activeValue: "$0",
        pendingSettlements: 0,
        successRate: "0%",
        successDescription: "No investments yet",
      };
    }

    const totalInvested = financedInvoices.reduce((sum, inv) => sum + inv.financedAmountInSui, 0);
    const totalInvestments = financedInvoices.length;

    const settledInvs = financedInvoices.filter((inv) => inv.status === InvoiceStatus.REPAID);
    const totalReturns = settledInvs.reduce((sum, inv) => sum + (inv.amountInSui - inv.financedAmountInSui), 0);

    const activeInvs = financedInvoices.filter((inv) => inv.status === InvoiceStatus.FUNDED);
    const activeValue = activeInvs.reduce((sum, inv) => sum + inv.financedAmountInSui, 0);

    const avgReturnRate = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
    const successRate = totalInvestments > 0 ? (settledInvs.length / totalInvestments) * 100 : 0;

    return {
      totalInvested: `${totalInvested.toFixed(2)} SUI`,
      totalInvestments: totalInvestments,
      totalReturns: `${totalReturns.toFixed(2)} SUI`,
      avgReturn: `${avgReturnRate.toFixed(2)}% average return`,
      activeValue: `${activeValue.toFixed(2)} SUI`,
      pendingSettlements: activeInvs.length,
      successRate: `${successRate.toFixed(0)}%`,
      successDescription: settledInvs.length === totalInvestments ? "All invoices settled" : `${settledInvs.length} of ${totalInvestments} settled`,
    };
  }, [financedInvoices]);

  const handleInvestmentClick = (investment: Investment) => {
    console.log("Viewing investment:", investment);
    // TODO: Implement investment detail view
  };

  // Show wallet connection prompt if no wallet
  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Wallet className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Please connect your wallet to view your investment portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  You need to connect a Sui wallet to access the investor dashboard
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <InvestorDashboardHeader />

          {/* KYC Status Banner */}
          {kycStatus === 'approved' && (
            <Card className="mb-6 border-green-500/50 bg-green-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      KYC Verified
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your account is verified and ready to invest
                    </p>
                  </div>
                  <Badge className="ml-auto" variant="outline">Verified</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus === 'pending' && (
            <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                      KYC Pending
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your verification is being processed
                    </p>
                  </div>
                  <Badge className="ml-auto" variant="outline">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <PortfolioStatsCards stats={portfolioStats} />

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-muted-foreground">Loading your investments from blockchain...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-500/50">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                  <AlertCircle className="h-8 w-8" />
                  <p className="font-semibold">Failed to load investments</p>
                  <p className="text-sm text-muted-foreground">{error.message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investments Tabs */}
          {!isLoading && !error && (
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList>
                <TabsTrigger value="active">
                  Active Investments ({activeInvestments.length})
                </TabsTrigger>
                <TabsTrigger value="settled">
                  Settled ({settledInvestments.length})
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {activeInvestments.length > 0 ? (
                  <InvestmentList
                    investments={activeInvestments}
                    emptyMessage="No active investments found"
                    onInvestmentClick={handleInvestmentClick}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Wallet className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-lg">No Active Investments</p>
                          <p className="text-sm text-muted-foreground">
                            Visit the marketplace to start investing in invoices
                          </p>
                        </div>
                        <Button onClick={() => window.location.href = '/marketplace'}>
                          Browse Marketplace
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settled">
                {settledInvestments.length > 0 ? (
                  <InvestmentList
                    investments={settledInvestments}
                    emptyMessage="No settled investments found"
                    onInvestmentClick={handleInvestmentClick}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <CheckCircle className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-lg">No Settled Investments</p>
                          <p className="text-sm text-muted-foreground">
                            Your completed investments will appear here
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PortfolioDistribution />
                  <PerformanceMetrics />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
