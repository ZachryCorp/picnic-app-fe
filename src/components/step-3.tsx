import { Button } from "./ui/button";
import { Form, FormField, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from "./ui/table";
import { ProvidedTicketsTable } from "./provided-tickets-table";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useFormStepper } from "@/hooks/form";
import { useTranslation } from "react-i18next";
import { step3Schema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getMealTicketPrice, getTicketPrice } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";

type Step3Values = z.infer<typeof step3Schema>;

export function Step3() {
  const { t } = useTranslation();

  const {
    decrementCurrentStep,
    incrementCurrentStep,
    setPayrollDeductionAmount,
    setIncludePayrollDeduction,
    fullTicketCount,
    mealTicketCount,
    setFullTicketCount,
    setMealTicketCount,
    park,
    user,
    additionalChildren,
  } = useFormStepper();

  const ticketPrice = getTicketPrice(park) ?? 0;
  const mealTicketPrice = getMealTicketPrice(park) ?? 0;

  const totalGuestTickets = user.guest ? 1 : 0;

  const [ticketQuantity, setTicketQuantity] = useState(fullTicketCount);
  const [mealTicketQuantity, setMealTicketQuantity] = useState(mealTicketCount);

  // Reset ticket quantities on mount
  useEffect(() => {
    setFullTicketCount(0);
    setMealTicketCount(0);
    setTicketQuantity(0);
    setMealTicketQuantity(0);
    setPayrollDeductionAmount(0);
  }, []);

  const form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      fullTicketQuantity: 0,
      mealTicketQuantity: 0,
    },
  });

  const onSubmit = (data: Step3Values) => {
    setFullTicketCount(data.fullTicketQuantity);
    setMealTicketCount(data.mealTicketQuantity);
    setPayrollDeductionAmount(
      data.fullTicketQuantity * ticketPrice +
        data.mealTicketQuantity * mealTicketPrice,
    );

    if (data.fullTicketQuantity === 0 && data.mealTicketQuantity === 0) {
      setIncludePayrollDeduction(false);
      return;
    }
    incrementCurrentStep();
  };

  return (
    <div className="flex flex-col gap-8">
      <ProvidedTicketsTable
        guestTickets={totalGuestTickets}
        childrenTickets={additionalChildren}
        lastYearChildrenTickets={user?.children ? user.children : 0}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-2xl font-bold text-center">
            {t("employeePurchase")}
          </h2>
          <Table className="border">
            <TableHeader className="bg-emerald-200">
              <TableRow>
                <TableHead className="text-xs sm:text-base">
                  {t("typeOfTicket")}
                </TableHead>
                <TableHead className="text-xs sm:text-base">
                  {t("quantity")}
                </TableHead>
                <TableHead className="text-xs sm:text-base">
                  {t("price")}
                </TableHead>
                <TableHead className="text-right text-xs sm:text-base">
                  {t("amount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="hidden sm:block">
                  {t("fullTicket")}
                </TableCell>
                <TableCell className="sm:hidden">
                  {t("fullTicketSmall")}
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="fullTicketQuantity"
                    render={({ field }) => (
                      <Input
                        type="number"
                        className="w-16"
                        {...field}
                        min={0}
                        onChange={(e) => {
                          field.onChange(
                            Number(e.target.valueAsNumber.toFixed(2)),
                          );
                          setTicketQuantity(
                            Number(e.target.valueAsNumber.toFixed(2)),
                          );
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>${ticketPrice}</TableCell>
                <TableCell className="text-right">
                  ${(ticketPrice * ticketQuantity).toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:block">
                  {t("mealTicket")}
                </TableCell>
                <TableCell className="sm:hidden">
                  {t("mealTicketSmall")}
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="mealTicketQuantity"
                    render={({ field }) => (
                      <Input
                        type="number"
                        className="w-16"
                        {...field}
                        min={0}
                        onChange={(e) => {
                          field.onChange(
                            Number(e.target.valueAsNumber.toFixed(2)),
                          );
                          setMealTicketQuantity(
                            Number(e.target.valueAsNumber.toFixed(2)),
                          );
                        }}
                      />
                    )}
                  />
                  <FormMessage />
                </TableCell>
                <TableCell>${mealTicketPrice}</TableCell>
                <TableCell className="text-right">
                  ${(mealTicketPrice * mealTicketQuantity).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold bg-emerald-200 text-[8px] sm:text-base">
                  {t("totalPurchasedByEmployee")}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  $
                  {(
                    ticketPrice * ticketQuantity +
                    mealTicketPrice * mealTicketQuantity
                  ).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <div className="flex justify-between gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                decrementCurrentStep();
              }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t("back")}
            </Button>
            <Button className="cursor-pointer" type="submit">
              {t("next")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
