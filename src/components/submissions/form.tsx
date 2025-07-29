import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Form, FormField, FormItem, FormLabel } from "../ui/form";
import { Submission } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSubmission, updateSubmission } from "@/api/submissions";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useFormStepper } from "@/hooks/form";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import { Label } from "../ui/label";

export function SubmissionForm({
  submission,
  closeModal,
}: {
  submission: Submission;
  closeModal?: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<Submission>({
    defaultValues: submission ?? {
      park: "Carowinds",
      additionalFullTicket: 0,
      additionalMealTicket: 0,
      ticketNumber: "",
      payrollDeduction: false,
      deductionPeriods: 0,
      childrenVerification: false,
      childrenVerified: false,
      notes: "",
      completed: false,
    },
  });

  const { user } = useFormStepper();

  const queryClient = useQueryClient();
  const { mutate: update } = useMutation({
    mutationFn: (data: Submission) => updateSubmission(submission.id, data),
    onSuccess: () => {
      toast.success("Submission updated successfully");
      if (closeModal) closeModal();
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: () => {
      toast.error("Error updating submission");
    },
  });

  const { mutate: removeSubmission } = useMutation({
    mutationFn: () => deleteSubmission(submission.id),
    onSuccess: () => {
      toast.success("Submission deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      if (closeModal) closeModal();
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Error deleting submission");
      setShowDeleteDialog(false);
    },
  });

  const handleSubmit = (data: Submission) => {
    update(data);
  };

  const handleDelete = () => {
    removeSubmission();
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="park"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Park</FormLabel>
              <Input type="text" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest</FormLabel>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="additionalFullTicket"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Full Ticket</FormLabel>
              <Input type="number" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="additionalMealTicket"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Meal Ticket</FormLabel>
              <Input type="number" {...field} />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <Label>Last Year's Children</Label>
          <p>{user?.children}</p>
        </div>
        <FormField
          control={form.control}
          name="pendingDependentChildren"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requesting Dependent Children</FormLabel>
              <Input type="number" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ticketNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket Number</FormLabel>
              <Input type="text" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deductionPeriods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deduction Period</FormLabel>
              <Input type="number" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <Textarea {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="childrenVerification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approve Dependent Children Request</FormLabel>
              <Select
                value={field.value ? "no" : "yes"}
                onValueChange={(value) => field.onChange(value === "no")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Approve Request</SelectItem>
                  <SelectItem value="no">No - Deny Request</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payrollDeduction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FormLabel>Payroll Deduction</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FormLabel>Completed</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <div className="flex justify-end">
            <Button type="submit">Update</Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              type="button"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </div>
        </div>
      </form>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-96 w-96">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
