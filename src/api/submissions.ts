import { baseUrl } from '.';

export const getSubmissions = async () => {
  try {
    const response = await fetch(`${baseUrl}/submissions?include=user`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return null;
  }
};

export const createSubmission = async (data: any) => {
  try {
    // If PDF data is provided as ArrayBuffer, convert to base64
    let processedData = { ...data };
    if (data.pdfData && data.pdfData instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(data.pdfData);
      const binaryString = uint8Array.reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        ''
      );
      processedData.pdfData = btoa(binaryString);
    }

    const response = await fetch(`${baseUrl}/submissions`, {
      method: 'POST',
      body: JSON.stringify(processedData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating submission:', error);
    return null;
  }
};

export const updateSubmission = async (id: string, data: any) => {
  try {
    const response = await fetch(`${baseUrl}/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating submission:', error);
    return null;
  }
};

export const deleteSubmission = async (id: string) => {
  try {
    const response = await fetch(`${baseUrl}/submissions/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting submission:', error);
    return null;
  }
};

export const getSubmission = async (id: string) => {
  try {
    const response = await fetch(`${baseUrl}/submissions/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching submission:', error);
    return null;
  }
};

export const getSubmissionPdf = async (id: string) => {
  try {
    const response = await fetch(`${baseUrl}/submissions/${id}/pdf`);
    if (!response.ok) {
      throw new Error('PDF not found');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching submission PDF:', error);
    return null;
  }
};
