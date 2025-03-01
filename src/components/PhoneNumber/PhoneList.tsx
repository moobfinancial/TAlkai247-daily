import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhoneListProps {
  phoneNumbers: {
    number: string;
    country: string;
    areaCode: string;
  }[];
  selectedNumber: string;
  onSelect: (number: string) => void;
  onDelete: (number: string) => void;
}

export function PhoneList({
  phoneNumbers,
  selectedNumber,
  onSelect,
  onDelete,
}: PhoneListProps) {
  console.log("phoneNumbers", phoneNumbers);
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Phone Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {phoneNumbers.length === 0 ? (
            <p className="text-gray-400">No phone numbers available</p>
          ) : (
            phoneNumbers.map((phoneNumber) => {
              console.log("first number", phoneNumber.number);
              return (
                <div
                  key={phoneNumber.number}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedNumber === phoneNumber.number
                      ? "bg-teal-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="flex-1 text-left justify-start"
                    onClick={() => onSelect(phoneNumber.number)}
                  >
                    {phoneNumber.number.toString()}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Phone Number</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete this phone number?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(phoneNumber.number)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
