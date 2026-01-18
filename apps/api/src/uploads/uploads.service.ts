import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

export interface StorageAdapter {
  upload(file: Express.Multer.File, type?: 'cover' | 'avatar'): Promise<string>;
  delete(url: string): Promise<void>;
}

@Injectable()
export class UploadsService implements StorageAdapter {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB default
  }

  async upload(file: Express.Multer.File, type: 'cover' | 'avatar' = 'cover'): Promise<string> {
    // Validate file
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Ensure upload directory exists
    const typeDir = path.join(this.uploadDir, type);
    await fs.mkdir(typeDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${nanoid(12)}${ext}`;
    const filepath = path.join(typeDir, filename);

    // Optimize image
    const optimizedBuffer = await this.optimizeImage(file.buffer, type);
    await fs.writeFile(filepath, optimizedBuffer);

    // Return relative URL
    return `/uploads/${type}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    if (!url || !url.startsWith('/uploads/')) {
      return;
    }

    const relativePath = url.replace('/uploads/', '');
    const filepath = path.join(this.uploadDir, relativePath);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File might not exist, ignore
    }
  }

  private async optimizeImage(buffer: Buffer, type: 'cover' | 'avatar'): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Resize based on type
    if (type === 'avatar') {
      return image
        .resize(200, 200, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Cover images
    const maxWidth = 1200;
    const maxHeight = 630;

    if (metadata.width && metadata.width > maxWidth) {
      return image
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Just optimize without resize
    return image.jpeg({ quality: 85 }).toBuffer();
  }
}
