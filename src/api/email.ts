import { baseUrl } from ".";

export const sendEmail = async (to: string, subject: string, text: string) => {
  const response = await fetch(`${baseUrl}/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, text }),
  });
  return response.json();
};

export const sendOrderConfirmationEmail = async (
  to: string,
  orderData: any,
  pdfData?: ArrayBuffer,
  pdfFileName?: string,
) => {
  // Convert PDF data to base64 if provided
  let pdfDataBase64 = undefined;
  if (pdfData) {
    const uint8Array = new Uint8Array(pdfData);
    const binaryString = uint8Array.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      "",
    );
    pdfDataBase64 = btoa(binaryString);
  }

  const response = await fetch(`${baseUrl}/email/order-confirmation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      orderData,
      pdfData: pdfDataBase64,
      pdfFileName,
    }),
  });
  return response.json();
};

export const sendDependentChildrenVerificationEmail = async (
  orderData: any,
) => {
  const response = await fetch(
    `${baseUrl}/email/dependent-children-verification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderData }),
    },
  );
  return response.json();
};
