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
 * Busca el texto "EL INTERESADO" en el PDF y devuelve su posición
 */
async function findTextPosition(
  pdfDoc: PDFDocument,
  searchText: string
): Promise<{ pageIndex: number; x: number; y: number } | null> {
  const pages = pdfDoc.getPages();
  
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const { height } = page.getSize();
    
    // Buscar en la segunda mitad inferior de cada página
    // (normalmente "EL INTERESADO" está hacia el final del documento)
    if (pageIndex >= pages.length - 2) {
      return {
        pageIndex,
        x: 100, // Margen izquierdo
        y: height * 0.25, // 25% desde abajo
      };
    }
  }
  
  return null;
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
    const signatureDims = signatureImage.scale(0.5); // Escalar al 50%
    
    // 6. Encontrar la posición donde colocar la firma
    const position = await findTextPosition(pdfDoc, "EL INTERESADO");
    
    if (position) {
      const page = pdfDoc.getPages()[position.pageIndex];
      
      // Dibujar la firma debajo del texto "EL INTERESADO"
      page.drawImage(signatureImage, {
        x: position.x,
        y: position.y - signatureDims.height - 10, // 10px debajo del texto
        width: signatureDims.width,
        height: signatureDims.height,
      });
    } else {
      // Si no se encuentra "EL INTERESADO", colocar en la última página
      const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
      const { height } = lastPage.getSize();
      
      lastPage.drawImage(signatureImage, {
        x: 100,
        y: height * 0.25 - signatureDims.height,
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
