
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
    const scriptId = 'cropper-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeCropper = () => {
        if (typeof window !== 'undefined' && window.Cropper && imageRef.current && src) {
            if (cropperRef.current) {
                cropperRef.current.destroy();
            }

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
    };
    
    if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js";
        script.async = true;
        script.onload = initializeCropper;
        document.body.appendChild(script);
    } else {
        initializeCropper();
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
      const croppedCanvas = cropperRef.current.getCroppedCanvas({
          // Make sure cropped image is not too small, but not too large either
          minWidth: 256,
          minHeight: 256,
          maxWidth: 4096,
          maxHeight: 4096,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
      });
      if (croppedCanvas) {
        const dataUrl = croppedCanvas.toDataURL('image/png');
        onCropComplete(dataUrl);
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
        <div className="max-h-[60vh] overflow-hidden bg-muted">
          <img ref={imageRef} src={src} alt="Source for cropping" style={{ maxWidth: '100%', opacity: isCropperReady ? 1 : 0 }} />
           {!isCropperReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
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
