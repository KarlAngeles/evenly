import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUsers, createBill } from "@/src/app/actions/billing";

type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  amount: string;
};

export function CreateBillModal({ user, onCreateBill }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billParticipants, setBillParticipants] = useState([]);
  const [validParticipants, setValidParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalBillAmount, setTotalBillAmount] = useState("");
  const [validationError, setValidationError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUsers();
        const validParticipants = result.filter((e) => e.id != user.id);
        setValidParticipants(validParticipants);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  const filteredUsers = validParticipants.filter(
    (user) =>
      (user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !billParticipants.some((participant) => participant.id === user.id)
  );

  const handleAddParticipant = (user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }) => {
    if (!billParticipants.some((participant) => participant.id === user.id)) {
      setBillParticipants([...billParticipants, { ...user, amount: "" }]);
      setSearchQuery("");
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setBillParticipants(billParticipants.filter((p) => p.id !== id));
  };

  const handleParticipantAmountChange = (id: string, amount: string) => {
    const updatedParticipants = billParticipants.map((p) =>
      p.id === id ? { ...p, amount } : p
    );
    setBillParticipants(updatedParticipants);
    validateTotalAmount(updatedParticipants);
  };

  const handleTotalBillAmountChange = (amount: string) => {
    setTotalBillAmount(amount);
    validateTotalAmount(billParticipants, amount);
  };

  const validateTotalAmount = (
    participants: Participant[],
    total = totalBillAmount
  ) => {
    const participantsTotal = participants.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );
    const billTotal = parseFloat(total);

    if (isNaN(billTotal)) {
      setValidationError("Please enter a valid total bill amount.");
    } else if (participantsTotal > billTotal) {
      setValidationError(
        "The sum of participant amounts exceeds the total bill amount."
      );
    } else if (participantsTotal <= 0) {
      setValidationError(
        "The sum of participant amounts must be a positive value."
      );
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newBill = {
      user_id: user.id, // Generate a unique ID
      name: formData.get("billName") as string,
      amount: parseFloat(formData.get("billAmount") as string),
      due_date: formData.get("date") as string,
      user_amounts: billParticipants.map((p) => ({
        user_id: p.id,
        amount: parseFloat(p.amount),
      })),
    };

    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const res = await createBill(newBill);

    console.log("Bill submitted:", newBill);
    onCreateBill();
    setIsModalOpen(false);
    setBillParticipants([]);
    setTotalBillAmount("");
    setValidationError("");
    toast({
      title: "Bill Created",
      description: "Your bill has been successfully created.",
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create a New Bill</DialogTitle>
          <DialogDescription>
            Enter the details for your new bill and add participants.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="billName">Bill Name</Label>
              <Input
                id="billName"
                name="billName"
                placeholder="Enter bill name"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                className="flex justify-between"
                id="date"
                name="date"
                type="date"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="billAmount">Total Bill Amount</Label>
              <Input
                id="billAmount"
                name="billAmount"
                type="number"
                placeholder="0.00"
                value={totalBillAmount}
                onChange={(e) => handleTotalBillAmountChange(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue="PHP" disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="button" size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {searchQuery && filteredUsers.length > 0 && (
                <Card>
                  <CardContent className="p-2">
                    {filteredUsers.map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleAddParticipant(user)}
                      >
                        {user.first_name} {user.last_name} ({user.email})
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
              {searchQuery && filteredUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No matching users found or all matching users have been added.
                </p>
              )}
            </div>
            {billParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between items-center space-x-2"
              >
                <Input
                  className="w-2/3"
                  value={participant.amount}
                  onChange={(e) =>
                    handleParticipantAmountChange(
                      participant.id,
                      e.target.value
                    )
                  }
                  placeholder="Amount"
                  type="number"
                />
                <span className="grow-0 text-sm">
                  {participant.first_name} {participant.last_name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveParticipant(participant.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}
          <Button type="submit" disabled={!!validationError}>
            Create Bill
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
