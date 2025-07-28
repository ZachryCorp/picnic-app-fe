import SignatureCanvas from "react-signature-canvas";
import { useState, useRef, useEffect } from "react";
import { loadPDFLib, createPDFBlobUrl } from "@/lib/pdf-utils";
import {
  PayrollDeductionFormValues,
  PayrollDeductionFormSchema,
} from "@/schema";
import { useTranslation } from "react-i18next";
import { useFormStepper } from "@/hooks/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  FormLabel,
  FormItem,
  FormField,
  FormControl,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeftIcon } from "lucide-react";

export default function PayrollDeductionForm() {
  const { t } = useTranslation();
  const {
    user,
    payrollDeductionAmount,
    incrementCurrentStep,
    decrementCurrentStep,
    setDeductionPeriods,
    setPdfData,
    setPdfFileName,
    setPdfFileSize,
  } = useFormStepper();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Cleanup previous PDF URL if exists
    if (pdfCleanup) {
      pdfCleanup();
    }
    setPdfData(null);
    setPdfFileName("");
    setPdfFileSize(0);

    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ),
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const form = useForm<PayrollDeductionFormValues>({
    resolver: zodResolver(PayrollDeductionFormSchema),
    defaultValues: {
      name: `${user?.firstName} ${user?.lastName}`,
      employeeId: user?.ein.toString() ?? "",
      department: user?.jobNumber ?? "",
      company: "",
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      amount: payrollDeductionAmount.toFixed(2),
      payPeriods: "",
      date2: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
    },
  });

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfCleanup, setPdfCleanup] = useState<(() => void) | null>(null);
  const [signatureError, setSignatureError] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const [signed, setSigned] = useState(false);

  const handleSubmit = async (data: PayrollDeductionFormValues) => {
    if (sigCanvasRef.current?.isEmpty()) {
      setSignatureError("Please sign the form");
      return;
    }

    setSignatureError("");
    setIsGeneratingPdf(true);
    setSigned(true);

    try {
      // Cleanup previous PDF URL if exists
      if (pdfCleanup) {
        pdfCleanup();
      }
      setPdfData(null);
      setPdfFileName("");
      setPdfFileSize(0);

      // 1. Load PDF
      const arrayBuffer = await fetch("/payroll-deduction-form.pdf").then((r) =>
        r.arrayBuffer(),
      );
      const { PDFDocument } = await loadPDFLib();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfForm = pdfDoc.getForm();

      // 2. Fill text fields
      pdfForm.getTextField("name").setText(data.name);
      pdfForm.getTextField("employeeId").setText(data.employeeId);
      pdfForm.getTextField("department").setText(data.department);
      pdfForm.getTextField("date").setText(data.date);
      pdfForm.getRadioGroup("company").select(data.company);
      pdfForm.getTextField("amount").setText(data.amount);
      pdfForm.getTextField("payPeriods").setText(data.payPeriods);
      pdfForm.getTextField("date2").setText(data.date2);

      // 3. Capture & embed signature with enhanced error handling
      const dataUrl = sigCanvasRef.current?.toDataURL();
      if (!dataUrl) {
        throw new Error("Failed to capture signature: dataURL is empty");
      }

      // Validate that the dataURL actually contains image data
      if (
        dataUrl ===
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      ) {
        throw new Error(
          "Signature canvas appears to be empty - contains only transparent pixel",
        );
      }

      const imgBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(imgBytes);

      // Check if signature field exists and handle it properly
      try {
        const signatureField = pdfForm.getTextField("signature");

        // Try to set the image on the form field
        signatureField.setImage(pngImage);

        // Alternative approach: Also draw the signature directly on the PDF page
        // This ensures the signature is visible even if the form field doesn't display images properly
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Get the signature field's position (if available)
        const fieldWidgets = signatureField.acroField.getWidgets();
        if (fieldWidgets.length > 0) {
          const widget = fieldWidgets[0];
          const rect = widget.getRectangle();

          // Draw the signature image directly on the page at the field location
          // Scale the image to fit the field dimensions
          const imageWidth = Math.min(rect.width, 200); // Max width of 200
          const imageHeight = Math.min(rect.height, 50); // Max height of 50

          firstPage.drawImage(pngImage, {
            x: rect.x,
            y: rect.y,
            width: imageWidth,
            height: imageHeight,
          });
        } else {
          // Fallback: Draw signature in a default location if field position can't be determined
          firstPage.drawImage(pngImage, {
            x: 400, // Default x position
            y: 200, // Default y position
            width: 150,
            height: 40,
          });
        }
      } catch (fieldError) {
        console.error("Error setting signature field:", fieldError);

        // Try alternative field names that might be used
        const alternativeNames = [
          "Signature",
          "signature_field",
          "sig",
          "employee_signature",
        ];
        let signatureSet = false;

        for (const altName of alternativeNames) {
          try {
            const altField = pdfForm.getTextField(altName);
            altField.setImage(pngImage);
            signatureSet = true;
            break;
          } catch (altError) {
            // Continue to next alternative
          }
        }

        if (!signatureSet) {
          // Final fallback: Draw signature directly on the page without using form fields
          const pages = pdfDoc.getPages();
          const firstPage = pages[0];

          firstPage.drawImage(pngImage, {
            x: 400, // Adjust these coordinates as needed
            y: 200,
            width: 150,
            height: 40,
          });
        }
      }

      // 4. Generate PDF and create blob URL
      const pdfBytes = await pdfDoc.save();
      const { url, cleanup } = createPDFBlobUrl(pdfBytes);

      // Store PDF data in Zustand state
      const fileName = `payroll-deduction-${user?.ein || "unknown"}-${Date.now()}.pdf`;
      setPdfData(pdfBytes.buffer);
      setPdfFileName(fileName);
      setPdfFileSize(pdfBytes.length);
      setDeductionPeriods(parseInt(data.payPeriods));
      setPdfUrl(url);
      setPdfCleanup(() => cleanup);

      // Timeout to allow the PDF to load
      setTimeout(() => {
        if (confirmButtonRef.current) {
          confirmButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("signature")) {
          setSignatureError(`Signature error: ${error.message}`);
        } else if (error.message.includes("field")) {
          setSignatureError(`PDF field error: ${error.message}`);
        } else {
          setSignatureError(`Failed to generate PDF: ${error.message}`);
        }
      } else {
        setSignatureError("Failed to generate PDF. Please try again.");
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="pb-4 space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input readOnly {...field} placeholder={t("name")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("employeeID")}</FormLabel>
                <FormControl>
                  <Input readOnly {...field} placeholder={t("employeeID")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t("department")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("department")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t("company")}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormItem className="flex gap-2">
                      <FormControl>
                        <RadioGroupItem value="zachryConstruction" />
                      </FormControl>
                      <FormLabel>Zachry Construction</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-2">
                      <FormControl>
                        <RadioGroupItem value="zachryHotel" />
                      </FormControl>
                      <FormLabel>Zachry Hotels</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-2">
                      <FormControl>
                        <RadioGroupItem value="zuus" />
                      </FormControl>
                      <FormLabel>Zuus</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-2">
                      <FormControl>
                        <RadioGroupItem value="capitalAggregates" />
                      </FormControl>
                      <FormLabel>Capitol Aggregates</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("amount")}</FormLabel>
                <FormControl>
                  <Input readOnly {...field} placeholder={t("amount")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payPeriods"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t("payPeriods")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("payPeriods")}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    type="number"
                    min={1}
                    max={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <Label
              required
              className={signatureError ? "text-destructive" : ""}
            >
              {t("signHere")}
            </Label>
            <div
              className={`rounded-md overflow-hidden ${
                signatureError ? "border border-destructive w-full" : ""
              }`}
            >
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                backgroundColor="#f0f0f0"
                canvasProps={{
                  className: "sigCanvas w-full h-24",
                }}
              />
            </div>
            {signatureError && (
              <p className="text-destructive">{signatureError}</p>
            )}
          </div>
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => {
                  sigCanvasRef.current?.clear();
                  setSigned(false);
                }}
                variant="outline"
                disabled={isGeneratingPdf}
              >
                {t("clearSignature")}
              </Button>
              {(!signed || !pdfUrl) && (
                <Button type="submit" disabled={isGeneratingPdf}>
                  {isGeneratingPdf ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    t("next")
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        {pdfUrl && (
          <div className="space-y-4">
            <p className="text-lg font-bold">{t("preview")}</p>
            {isMobile ? (
              <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                <p className="text-center text-muted-foreground">
                  PDF preview is not available on mobile devices. Please
                  download the PDF to view it.
                </p>
                <Button
                  variant="secondary"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <a href={pdfUrl} download="filled-form.pdf">
                    {t("downloadPDF")}
                  </a>
                </Button>
              </div>
            ) : (
              <iframe
                className="w-full h-[50vh] sm:h-[70vh] md:h-[80vh]"
                src={pdfUrl}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" asChild>
                <a href={pdfUrl} download="filled-form.pdf">
                  {t("downloadPDF")}
                </a>
              </Button>
              <Button
                ref={confirmButtonRef}
                onClick={() => incrementCurrentStep()}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}
