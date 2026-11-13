import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { CLoudinaryImageResponseInterface } from './interfaces/cloudinary-image.response.interface';

@Injectable()
export class UploadsService {
  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<CLoudinaryImageResponseInterface[]> {
    if (!files || files.length === 0) {
      throw new HttpException(
        'No se ha subido ningún archivo válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    const uploadedImages: CLoudinaryImageResponseInterface[] = [];

    for (const file of files) {
      // Verificar que el archivo sea una imagen
      if (!file.mimetype.startsWith('image/')) {
        throw new HttpException(
          'Solo se permiten formatos de imagen',
          HttpStatus.BAD_REQUEST,
        );
      }

      const buffer = file.buffer;
      const seoName = file.originalname
        .replace(/\.[^.]+$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      // console.log(`Subiendo imagen: ${seoName} a la carpeta: ${folder}`);

      try {
        const uploadResult: UploadApiResponse = await new Promise(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: `${folder}`, // Guarda el archivo dentro de una carpeta especifica.
                  resource_type: 'image',
                  public_id: seoName, // Cloudinary no requiere incluir la extensión en el nombre del archivo.
                  unique_filename: false, // Evita que Cloudinary le agregue un sufijo aleatorio.
                  use_filename: true, // usa el nombre interno si no se define public_id.
                }, 
                (
                  error: UploadApiErrorResponse | undefined,
                  result: UploadApiResponse | undefined,
                ) => {
                  if (error) {
                    return reject(error);
                  }
                  if (result) {
                    return resolve(result);
                  }
                  return reject(
                    new Error('No se recibió respuesta de Cloudinary'),
                  );
                },
              )
              .end(buffer);
          },
        );

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

  async deleteImage(public_id: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(public_id);
    } catch (error: any) {
      throw new HttpException(
        `Error al eliminar la imagen: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
