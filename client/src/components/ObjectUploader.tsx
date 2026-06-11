// Reference: blueprint:javascript_object_storage - File upload component
import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * Componente de subida de archivos que envía el fichero al servidor Express
 * (POST /api/objects/upload-file, multipart/form-data), que lo sube a R2 y
 * devuelve { objectPath }.  El objectPath está disponible en cada elemento de
 * result.successful como (file.response?.body as any)?.objectPath.
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10 MB por defecto
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(XHRUpload, {
        endpoint: "/api/objects/upload-file",
        fieldName: "file",
        withCredentials: true,
      })
      .on("complete", (result) => {
        onComplete?.(result);
      })
  );

  return (
    <div>
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        className={buttonClassName}
        data-testid="button-upload-document"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
