import { useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { getSubmissionPdf } from '@/api/submissions';
import { Submission } from '@/types';

interface PdfViewerModalProps {
  submission: Submission;
}

export function PdfViewerModal({ submission }: PdfViewerModalProps) {
  const [open, setOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleViewPdf = async () => {
    if (pdfUrl) {
      // PDF already loaded
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const pdfBlob = await getSubmissionPdf(submission.id.toString());
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      } else {
        setError('PDF not found or failed to load');
      }
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      handleViewPdf();
    } else {
      // Cleanup blob URL when modal closes
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl('');
      }
    }
  };

  // Check if this submission has a PDF
  const hasPdf = submission.pdfFileName || submission.pdfFileSize;

  if (!hasPdf) {
    return (
      <Button size='sm' variant='ghost' disabled>
        <FileTextIcon className='w-4 h-4 text-muted-foreground' />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' variant='ghost'>
          <FileTextIcon className='w-4 h-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>
            PDF Document - {submission.pdfFileName || 'Document'}
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-col h-[70vh]'>
          {isLoading && (
            <div className='flex items-center justify-center h-full'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              <span className='ml-2'>Loading PDF...</span>
            </div>
          )}
          {error && (
            <div className='flex items-center justify-center h-full text-red-500'>
              <p>{error}</p>
            </div>
          )}
          {pdfUrl && !isLoading && !error && (
            <iframe
              src={pdfUrl}
              className='w-full h-full border rounded'
              title='PDF Viewer'
            />
          )}
        </div>
        {pdfUrl && (
          <div className='flex justify-end gap-2 mt-4'>
            <Button variant='outline' asChild>
              <a
                href={pdfUrl}
                download={submission.pdfFileName || 'document.pdf'}
              >
                Download PDF
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
