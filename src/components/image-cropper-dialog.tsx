
"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

declare global {
    interface Window {
        Cropper: any;
    }
}

interface ImageCropperDialogProps {
  src: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

export function ImageCropperDialog({ src, onCropComplete, onClose, isProcessing = false }: ImageCropperDialogProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<any>(null);
  const [isCropperReady, setIsCropperReady] = useState(false);

  useEffect(() => {
    if (imageRef.current && src) {
      const cropperInstance = new window.Cropper(imageRef.current, {
        aspectRatio: 0,
        viewMode: 1,
        autoCropArea: 0.9,
        dragMode: 'move',
        guides: true,
        background: false,
        ready: () => {
            setIsCropperReady(true);
        }
      });
      cropperRef.current = cropperInstance;
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [src]);

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.getCroppedCanvas();
      if (croppedCanvas) {
        onCropComplete(croppedCanvas.toDataURL());
      }
    }
  };

  return (
    <Dialog open={!!src} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the selection to focus only on the weapon's stats area for best results.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-hidden">
          <img ref={imageRef} src={src} alt="Source for cropping" style={{ maxWidth: '100%' }} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleCrop} disabled={!isCropperReady || isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Analyzing...' : 'Crop & Analyze'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
