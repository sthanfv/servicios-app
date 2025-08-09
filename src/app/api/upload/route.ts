import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs/promises';
import { NextRequest } from 'next/server';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse the form data
const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export async function POST(request: NextRequest) {
  try {
    const { files } = await parseForm(request);
    
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile) {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(imageFile.filepath);
    const filename = imageFile.originalFilename || 'upload.jpg';

    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image.', message: error.message }, { status: 500 });
  }
}
