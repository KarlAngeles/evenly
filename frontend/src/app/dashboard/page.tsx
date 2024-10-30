"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateBillModal } from "@/components/create-bill-modal";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  HandCoins,
  Badge,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getAmountOwed,
  getAmountReceivable,
  getBills,
  getDebts,
  settleDebt,
} from "@/src/app/actions/billing";
import { getSession } from "@/src/app/actions/auth";

export default function Page() {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [billPages, setBillPages] = useState(0);
  const [debtPages, setDebtPages] = useState(0);

  const [user, setUser] = useState([]);
  const [bills, setBills] = useState([]);
  const [debts, setDebts] = useState([]);
  const [amountOwed, setAmountOwed] = useState("0.0");
  const [amountReceivable, setAmountReceivable] = useState("0.0");

  const unsettledDebts = debts.filter((debt) => !debt.settled).length;

  const fetchBills = async () => {
    const userData = await fetchUserData();
    const bills = await getBills(userData.id, currentPage1);
    const amountReceivable = await getAmountReceivable(userData.id);

    setBills(bills.data);
    setBillPages(bills.pagination.pages);
    setAmountReceivable(amountReceivable?.amount_receivable);
  };

  const fetchDebts = async () => {
    const userData = await fetchUserData();
    const debts = await getDebts(userData.id, currentPage1);
    const amountOwed = await getAmountOwed(userData.id);

    setDebtPages(debts.pagination.pages);
    setDebts(debts.data);
    setAmountOwed(amountOwed?.amount_owed);
  };

  const fetchUserData = async () => {
    const session = await getSession();
    const userData = session?.user?.data;
    setUser(userData);

    return userData;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchBills();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchDebts();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage2]);

  const handleCreateBill = () => {
    fetchBills();
  };

  const handleSettleBill = async (billId) => {
    await settleDebt(billId, user.id);
    fetchDebts();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="grid min-h-screen w-full bg-moon-gray">
        <div className="flex flex-col">
          <header className="sticky top-0 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="font-semibold text-lg">Dashboard</h1>
            </div>
            <CreateBillModal user={user} onCreateBill={handleCreateBill} />
          </header>
          <main className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="container mx-auto py-6 space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">
                        Unsettled Debts
                      </CardTitle>
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{unsettledDebts}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">
                        Your friends owe you
                      </CardTitle>
                      <HandCoins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ₱{amountReceivable}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">
                        You owe your friends
                      </CardTitle>
                      <HandCoins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₱{amountOwed}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bills Created */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Bills Created</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bills.length > 0 ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
                          {bills.map((bill) => (
                            <Card key={bill.id}>
                              <CardHeader>
                                <CardTitle className="text-xl">
                                  {bill.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-lg">
                                  Amount: ₱{bill.amount}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Due Date:{" "}
                                  {new Date(bill.due_date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Participants: {bill.debtors.length}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="flex justify-center mt-4 space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setCurrentPage1((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage1 === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Page {currentPage1} of {billPages}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setCurrentPage1((prev) =>
                                Math.min(prev + 1, billPages)
                              )
                            }
                            disabled={currentPage1 === billPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p>No owned bills found.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Bills Participating In */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Bills Participating In
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {debts.length > 0 ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
                          {debts.map((debt) => (
                            <Card key={debt.id}>
                              <CardHeader>
                                <CardTitle className="text-xl">
                                  {debt?.bill?.name}
                                </CardTitle>
                                <div className="flex space-x-2">
                                  <Badge
                                    variant={
                                      debt.settled ? "success" : "destructive"
                                    }
                                  >
                                    {debt.settled ? (
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                    ) : (
                                      <XCircle className="mr-1 h-3 w-3" />
                                    )}
                                  </Badge>
                                  <span>
                                    {debt.settled ? "Paid" : "Unpaid"}
                                  </span>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-lg">
                                  Amount: ₱{debt?.amount_owed}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Due Date:{" "}
                                  {new Date(
                                    debt?.bill?.due_date
                                  ).toLocaleDateString()}
                                </p>
                                {!debt.settled && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button className="mt-2">
                                        Settle Debt
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Confirm Payment
                                        </DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to pay ₱
                                          {debt?.amount_owed} for{" "}
                                          {debt?.bill?.name}?
                                        </DialogDescription>
                                      </DialogHeader>
                                      <Button
                                        onClick={() =>
                                          handleSettleBill(debt.bill_id)
                                        }
                                      >
                                        Confirm Payment
                                      </Button>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="flex justify-center mt-4 space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setCurrentPage2((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage2 === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Page {currentPage2} of {debtPages}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setCurrentPage2((prev) =>
                                Math.min(prev + 1, debtPages)
                              )
                            }
                            disabled={currentPage2 === debtPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p>No bills participated in.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
