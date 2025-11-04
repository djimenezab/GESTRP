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
    const signatureDims = signatureImage.scale(0.35); // Escalar al 35%
    
    // 6. Obtener las páginas donde colocar la firma (últimas 2 páginas)
    const pagesToSign = getSignaturePages(pdfDoc);
    
    console.log(`[PDF Signature] Total de páginas: ${pdfDoc.getPageCount()}`);
    console.log(`[PDF Signature] Páginas a firmar: ${pagesToSign.join(", ")}`);
    console.log(`[PDF Signature] Dimensiones de firma: ${signatureDims.width}x${signatureDims.height}`);
    
    // 7. Colocar la firma en cada página con posiciones específicas
    // Constante de conversión: 1 cm = 28.35 puntos
    const CM_TO_POINTS = 28.35;
    
    for (const pageIndex of pagesToSign) {
      const page = pdfDoc.getPages()[pageIndex];
      const { height, width } = page.getSize();
      const rotation = page.getRotation().angle; // Obtener la rotación de la página
      
      console.log(`[PDF Signature] Página ${pageIndex + 1} tamaño: ${width}x${height} puntos, rotación: ${rotation}°`);
      
      let x: number;
      let yFromTop: number;
      
      // Posiciones específicas para cada página de la Comisión de Servicio
      if (pageIndex === 0) {
        // Página 1: 1 cm desde izquierda, 25 cm desde arriba
        x = 1 * CM_TO_POINTS;
        yFromTop = 25 * CM_TO_POINTS;
      } else if (pageIndex === 1) {
        // Página 2: Ajustada temporalmente para que quede dentro de los límites
        // (El ancho de la página es ~21 cm, por lo que 21 cm desde izquierda está fuera)
        x = 11 * CM_TO_POINTS; // Centro-derecha de la página
        yFromTop = 16 * CM_TO_POINTS;
      } else {
        // Fallback para otras páginas (no debería ocurrir normalmente)
        x = 1 * CM_TO_POINTS;
        yFromTop = 25 * CM_TO_POINTS;
      }
      
      // Convertir Y desde arriba a coordenadas PDF (desde abajo)
      const y = height - yFromTop - signatureDims.height;
      
      console.log(`[PDF Signature] Página ${pageIndex + 1} - Posición: x=${x.toFixed(2)} (${(x/CM_TO_POINTS).toFixed(2)}cm), y=${y.toFixed(2)} (${(yFromTop/CM_TO_POINTS).toFixed(2)}cm desde arriba)`);
      
      // Configurar la imagen con rotación si es necesario
      // Si la página tiene rotación de 90° o 270°, debemos compensar
      const imageOptions: any = {
        x,
        y,
        width: signatureDims.width,
        height: signatureDims.height,
      };
      
      // Si la página está rotada, NO rotar la imagen (para mantenerla horizontal)
      // pdf-lib automáticamente ajusta las coordenadas según la rotación de la página
      
      page.drawImage(signatureImage, imageOptions);
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
