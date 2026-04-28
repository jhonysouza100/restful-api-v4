import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { CLoudinaryImageResponseInterface } from './interfaces/cloudinary-image.response.interface';

@Injectable()
export class UploadsService {
  async uploadImages(files: Express.Multer.File[]): Promise<CLoudinaryImageResponseInterface[]> {
    if (!files || files.length === 0) {
      throw new HttpException("No se ha subido ningún archivo válido", HttpStatus.BAD_REQUEST);
    }

    const uploadedImages: CLoudinaryImageResponseInterface[] = [];

    for (const file of files) {
      // Verificar que el archivo sea una imagen
      if (!file.mimetype.startsWith("image/")) {
        throw new HttpException("Solo se permiten formatos de imagen", HttpStatus.BAD_REQUEST);
      }

      const buffer = file.buffer;

      try {
        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "products", resource_type: "image" },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
              if (error) {
                return reject(error);
              }
              if (result) {
                return resolve(result);
              }
              return reject(new Error("No se recibió respuesta de Cloudinary"));
            }
          ).end(buffer);
        });

        uploadedImages.push({
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url,
        });
      } catch (error: any) {
        console.error(`${file.originalname}`, error);
        throw new HttpException(
          `${error.message}: ${file.originalname}`,
          error.http_code || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return uploadedImages;
  }
}