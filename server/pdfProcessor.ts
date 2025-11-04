import { PDFDocument } from "pdf-lib";
import { ObjectStorageService } from "./objectStorage";
import crypto from "crypto";

/**
 * Convierte una firma en formato data URL a un buffer PNG
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

/**
 * Obtiene las páginas donde debe colocarse la firma
 * Para Comisión de Servicio, típicamente son las últimas 2 páginas
 */
function getSignaturePages(pdfDoc: PDFDocument): number[] {
  const totalPages = pdfDoc.getPageCount();
  const signaturePages: number[] = [];
  
  // Si hay 2 o más páginas, firmar las últimas 2
  if (totalPages >= 2) {
    signaturePages.push(totalPages - 2); // Penúltima página
    signaturePages.push(totalPages - 1); // Última página
  } else if (totalPages === 1) {
    // Si solo hay 1 página, firmar esa página
    signaturePages.push(0);
  }
  
  return signaturePages;
}

interface SignPdfResult {
  signedPdfPath: string;
  signaturePath: string;
}

/**
 * Añade una firma digital a un PDF existente
 * @param pdfPath Ruta del PDF original en object storage
 * @param signatureDataUrl Firma en formato data URL
 * @param objectStorageService Servicio de object storage
 * @returns Rutas del PDF firmado y de la imagen de la firma
 */
export async function signPdfWithSignature(
  pdfPath: string,
  signatureDataUrl: string,
  objectStorageService: ObjectStorageService
): Promise<SignPdfResult> {
  try {
    // 1. Normalizar la ruta del PDF (convertir URL completa a ruta relativa)
    const normalizedPdfPath = objectStorageService.normalizeObjectEntityPath(pdfPath);
    
    // 2. Descargar el PDF original desde object storage
    const pdfFile = await objectStorageService.getObjectEntityFile(normalizedPdfPath);
    const [pdfBuffer] = await pdfFile.download();
    
    // 2. Cargar el PDF con pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // 3. Convertir la firma a buffer PNG
    const signatureBuffer = dataUrlToBuffer(signatureDataUrl);
    
    // 4. Subir la imagen de la firma a object storage
    const signatureObjectId = crypto.randomUUID();
    const signaturePath = `/objects/uploads/${signatureObjectId}`;
    
    // Crear el File usando el helper del servicio
    const signatureFile = objectStorageService.createObjectEntityFile(signaturePath);
    
    await signatureFile.save(signatureBuffer, {
      contentType: "image/png",
      metadata: {
        contentType: "image/png",
      },
    });
    
    // 5. Incrustar la firma en el PDF
    const signatureImage = await pdfDoc.embedPng(signatureBuffer);
    const signatureDims = signatureImage.scale(0.35); // Escalar al 35% para un tamaño más apropiado
    
    // 6. Obtener las páginas donde colocar la firma (últimas 2 páginas)
    const pagesToSign = getSignaturePages(pdfDoc);
    
    // 7. Colocar la firma en cada página
    for (const pageIndex of pagesToSign) {
      const page = pdfDoc.getPages()[pageIndex];
      const { height, width } = page.getSize();
      
      // Posición típica de "EL INTERESADO" en Comisión de Servicio:
      // - Centrado horizontalmente (o ligeramente a la derecha)
      // - En la parte inferior, aproximadamente 150-180 puntos desde abajo
      const x = (width / 2) - (signatureDims.width / 2); // Centrado horizontalmente
      const y = 150; // 150 puntos desde abajo (debajo de "EL INTERESADO")
      
      page.drawImage(signatureImage, {
        x,
        y,
        width: signatureDims.width,
        height: signatureDims.height,
      });
    }
    
    // 7. Guardar el PDF modificado
    const signedPdfBytes = await pdfDoc.save();
    
    // 8. Subir el PDF firmado a object storage
    const signedPdfObjectId = crypto.randomUUID();
    const signedPdfPath = `/objects/uploads/${signedPdfObjectId}`;
    
    // Crear el File usando el helper del servicio
    const signedPdfFile = objectStorageService.createObjectEntityFile(signedPdfPath);
    
    await signedPdfFile.save(Buffer.from(signedPdfBytes), {
      contentType: "application/pdf",
      metadata: {
        contentType: "application/pdf",
      },
    });
    
    return {
      signedPdfPath,
      signaturePath,
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("No se pudo procesar el PDF");
  }
}
