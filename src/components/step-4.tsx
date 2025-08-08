import { Button } from "./ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Form,
} from "./ui/form";
import { Input } from "./ui/input";
import { loadPDFLib } from "@/lib/pdf-utils";

import {
  sendDependentChildrenVerificationEmail,
  sendOrderConfirmationEmail,
} from "@/api/email";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { step4Schema } from "@/schema";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from "./ui/table";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStepper } from "@/hooks/form";
import { ProvidedTicketsTable } from "./provided-tickets-table";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { createSubmission } from "@/api/submissions";
import { getMealTicketPrice, getTicketPrice } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";

type Step4Values = z.infer<typeof step4Schema>;

export function Step4() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    fullTicketCount,
    mealTicketCount,
    payrollDeductionAmount,
    user,
    park,
    deductionPeriods,
    additionalChildrenReason,
    childrenVerification,
    pdfData,
    pdfFileName,
    pdfFileSize,
    additionalChildren,
    decrementCurrentStep,
  } = useFormStepper();

  const ticketPrice = getTicketPrice(park) ?? 0;
  const mealTicketPrice = getMealTicketPrice(park) ?? 0;

  const totalGuestTickets = user.guest ? 1 : 0;
  const totalChildrenTickets = childrenVerification
    ? additionalChildren
    : additionalChildren === user?.children
      ? user?.children
      : additionalChildren;

  const form = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      email: "",
    },
  });

  const handlePrint = async () => {
    // Dynamically load PDF library
    const { PDFDocument, rgb } = await loadPDFLib();

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const fontSize = 11;
    const lineHeight = fontSize * 1.3;
    let y = height - 40; // Start from top with margin

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options = {}) => {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
        ...options,
      });
    };

    // Helper function to draw a table
    const drawTable = (
      startX: number,
      startY: number,
      rows: string[][],
      columnWidths: number[],
      headerBgColor = rgb(0.9, 0.9, 0.9),
      footerRows: number[] = [],
    ) => {
      const cellHeight = lineHeight * 1.4;
      const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

      // Draw table background and borders
      let currentX = startX;
      rows.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        const isFooter = footerRows.includes(rowIndex);
        const bgColor = isHeader
          ? headerBgColor
          : isFooter
            ? rgb(0.95, 0.95, 0.95)
            : rgb(1, 1, 1);

        // Draw row background
        page.drawRectangle({
          x: startX,
          y: startY - (rowIndex + 1) * cellHeight,
          width: tableWidth,
          height: cellHeight,
          color: bgColor,
        });

        // Draw cell borders and text
        currentX = startX;
        row.forEach((cell, colIndex) => {
          // Draw cell border
          page.drawRectangle({
            x: currentX,
            y: startY - (rowIndex + 1) * cellHeight,
            width: columnWidths[colIndex],
            height: cellHeight,
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 0.5,
          });

          // Add cell text
          const textY = startY - (rowIndex + 1) * cellHeight + cellHeight / 3;
          const isRightAlign = colIndex === row.length - 1 && !isHeader;

          // Better text positioning for right-aligned columns
          let textX;
          if (isRightAlign) {
            // Calculate text width and position from right edge with more padding
            const estimatedTextWidth = cell.length * (fontSize * 0.6); // Rough estimate
            textX = currentX + columnWidths[colIndex] - estimatedTextWidth - 5;
          } else {
            textX = currentX + 8;
          }

          addText(cell, textX, textY, {
            size: isHeader || isFooter ? fontSize : fontSize - 1,
          });

          currentX += columnWidths[colIndex];
        });
      });

      return rows.length * cellHeight;
    };

    // Title and header
    addText(t("orderSummary"), width / 2 - 60, y, {
      size: 20,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= lineHeight * 2.5;

    // Employee information
    addText(`Employee: ${user.firstName || ""} ${user.lastName}`, 50, y, {
      size: 14,
    });
    y -= lineHeight;
    addText(`Employee ID: ${user.ein}`, 50, y);
    y -= lineHeight;
    addText(`${t("park")}: ${park}`, 50, y);
    y -= lineHeight * 2;

    // Park Information
    addText(t("parkInformation"), 50, y, {
      size: 10,
    });
    y -= lineHeight * 2;

    // Children verification warning
    if (childrenVerification) {
      addText("*** DEPENDENT CHILDREN VERIFICATION REQUIRED ***", 50, y, {
        size: 12,
        color: rgb(0.8, 0.2, 0.2),
      });
      y -= lineHeight * 2;
    }

    // Section A
    addText(`${t("section")} A - ${t("fromZachryCorp")}`, 50, y, {
      size: 16,
      color: rgb(0.2, 0.4, 0.2),
    });
    y -= lineHeight * 1.5;

    const sectionATable = [
      [t("typeOfTicket"), t("quantity")],
      [t("employeeTickets"), "1"],
      [t("guestTickets"), totalGuestTickets.toString()],
      [t("childrenTickets"), totalChildrenTickets.toString()],
    ];
    const sectionAHeight = drawTable(
      50,
      y,
      sectionATable,
      [320, 80],
      rgb(0.8, 0.95, 0.8),
    );
    y -= sectionAHeight + lineHeight * 2;

    // Section B
    addText(`${t("section")} B - ${t("employeePurchase")}`, 50, y, {
      size: 16,
      color: rgb(0.2, 0.4, 0.2),
    });
    y -= lineHeight * 1.5;

    const sectionBTable = [
      [t("typeOfTicket"), t("quantity"), t("price"), t("amountDue")],
      [
        t("fullTicket"),
        fullTicketCount.toString(),
        `$${ticketPrice.toFixed(2)}`,
        `$${(fullTicketCount * ticketPrice).toFixed(2)}`,
      ],
      [
        t("mealTicket"),
        mealTicketCount.toString(),
        `$${mealTicketPrice.toFixed(2)}`,
        `$${(mealTicketCount * mealTicketPrice).toFixed(2)}`,
      ],
      [
        t("totalPurchasedByEmployee"),
        "",
        "",
        `$${payrollDeductionAmount.toFixed(2)}`,
      ],
    ];
    const sectionBHeight = drawTable(
      50,
      y,
      sectionBTable,
      [220, 60, 60, 100],
      rgb(0.8, 0.95, 0.8),
      [3], // Footer row
    );
    y -= sectionBHeight + lineHeight * 2;

    // Section C
    addText(`${t("section")} C - ${t("summary")}`, 50, y, {
      size: 16,
      color: rgb(0.2, 0.4, 0.2),
    });
    y -= lineHeight * 1.5;

    const totalTicketsZachry = 1 + totalGuestTickets + totalChildrenTickets;
    const totalTicketsEmployee = fullTicketCount + mealTicketCount;
    const totalTicketsOrdered = totalTicketsZachry + totalTicketsEmployee;

    const sectionCTable = [
      [t("description"), t("quantity")],
      [t("numberOfTicketsPurchasedByZachry"), totalTicketsZachry.toString()],
      [
        t("numberOfTicketsPurchasedByEmployee"),
        totalTicketsEmployee.toString(),
      ],
      [t("totalNumberOfTicketsOrdered"), totalTicketsOrdered.toString()],
    ];
    const sectionCHeight = drawTable(
      50,
      y,
      sectionCTable,
      [360, 80],
      rgb(0.9, 0.9, 0.95),
      [3], // Footer row
    );
    y -= sectionCHeight + lineHeight * 2;

    // Payroll deduction info
    if (payrollDeductionAmount > 0 && deductionPeriods > 0) {
      addText("Payroll Deduction Information:", 50, y, { size: 14 });
      y -= lineHeight;
      addText(`Total Amount: $${payrollDeductionAmount.toFixed(2)}`, 50, y);
      y -= lineHeight;
      addText(`Deduction Periods: ${deductionPeriods} pay periods`, 50, y);
      y -= lineHeight;
      addText(
        `Amount per Period: $${(payrollDeductionAmount / deductionPeriods).toFixed(2)}`,
        50,
        y,
      );
    }

    // Footer
    const footerY = 50;
    addText(`Generated on: ${new Date().toLocaleDateString()}`, 50, footerY, {
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });
    addText("Zachry Corporation", width - 150, footerY, {
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Open PDF in new window for printing
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const { mutate: create } = useMutation({
    mutationFn: createSubmission,
  });

  const onSubmit = (data: Step4Values) => {
    const submissionData = {
      userId: user.ein,
      park,
      guest: user.guest,
      additionalFullTicket: fullTicketCount,
      additionalMealTicket: mealTicketCount,
      childrenVerification,
      pendingDependentChildren: additionalChildren,
      additionalChildrenReason,
      payrollDeduction: !!payrollDeductionAmount,
      deductionPeriods,
      // Include PDF data if available
      pdfData,
      pdfFileName,
      pdfFileSize,
    };

    create(submissionData);

    // Prepare order data for email template
    const orderData = {
      firstName: user.firstName || "",
      lastName: user.lastName,
      ein: user.ein,
      location: user.location,
      additionalChildrenReason,
      park,
      employeeTickets: 1,
      guestTickets: totalGuestTickets,
      childrenTickets: additionalChildren,
      additionalFullTickets: fullTicketCount,
      additionalMealTickets: mealTicketCount,
      totalTickets:
        1 +
        totalGuestTickets +
        totalChildrenTickets +
        fullTicketCount +
        mealTicketCount,
      payrollDeductionAmount,
      deductionPeriods,
      hasPayrollDeduction: !!payrollDeductionAmount,
      childrenVerification,
      lastYearChildrenTickets: user?.children,
    };

    if (childrenVerification) {
      sendDependentChildrenVerificationEmail(orderData);
    }

    if (data.email && data.email.trim() !== "") {
      sendOrderConfirmationEmail(
        data.email,
        orderData,
        pdfData || undefined,
        pdfFileName || undefined,
      );
    }
    navigate({ to: "/confirmation" });
  };

  return (
    <div className="flex flex-col gap-8 pb-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-center">
          {t("section")} A - {t("fromZachryCorp")}
        </h2>
        {childrenVerification && (
          <p className="text-sm text-center text-destructive">
            {t("dependentChildrenVerification")}
          </p>
        )}
      </div>
      <ProvidedTicketsTable
        guestTickets={totalGuestTickets}
        childrenTickets={totalChildrenTickets}
        lastYearChildrenTickets={user?.children ? user.children : 0}
      />
      <Form {...form}>
        <h2 className="text-2xl font-bold text-center">
          {t("section")} B - {t("employeePurchase")}
        </h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Table className="border text-[9px] sm:text-base">
            <TableHeader className="bg-emerald-200">
              <TableRow>
                <TableHead>{t("typeOfTicket")}</TableHead>
                <TableHead>{t("quantity")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead className="text-right">{t("amount")}</TableHead>
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
                <TableCell>{fullTicketCount}</TableCell>
                <TableCell>${ticketPrice}</TableCell>
                <TableCell className="text-right">
                  ${(fullTicketCount * ticketPrice).toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:block">
                  {t("mealTicket")}
                </TableCell>
                <TableCell className="sm:hidden">
                  {t("mealTicketSmall")}
                </TableCell>
                <TableCell>{mealTicketCount}</TableCell>
                <TableCell>${mealTicketPrice}</TableCell>
                <TableCell className="text-right">
                  ${(mealTicketCount * mealTicketPrice).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold bg-emerald-200 text-[9px] sm:text-base">
                  {t("totalPurchasedByEmployee")}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  ${payrollDeductionAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <h2 className="text-2xl font-bold text-center">{t("section")} C</h2>
          <Table className="border">
            <TableBody className="text-[8px] sm:text-base">
              <TableRow>
                <TableCell className="bg-blue-200">
                  {t("numberOfTicketsPurchasedByZachry")}
                </TableCell>
                <TableCell className="text-right">
                  {1 + totalGuestTickets + totalChildrenTickets}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="bg-emerald-200">
                  {t("numberOfTicketsPurchasedByEmployee")}
                </TableCell>
                <TableCell className="text-right">
                  {fullTicketCount + mealTicketCount}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">
                  {t("totalNumberOfTicketsOrdered")}
                </TableCell>
                <TableCell className="text-right">
                  {
                    1 + // Employee ticket
                      totalGuestTickets + // Guest ticket
                      totalChildrenTickets + // Children tickets
                      fullTicketCount + // Additional full tickets
                      mealTicketCount // Additional meal tickets
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    className="w-96"
                    placeholder={t("email")}
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("enterYourEmailToRecieveACopyOfThisOrder")}
                </FormDescription>
              </FormItem>
            )}
          />
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handlePrint}>
                {t("print")}
              </Button>
              <Button type="submit">{t("submit")}</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
