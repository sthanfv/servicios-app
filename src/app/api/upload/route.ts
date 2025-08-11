import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs/promises';
import { NextRequest } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.parse(req as any, (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export async function POST(request: NextRequest) {
  try {
    const { files } = await parseForm(request);
    
    const imageFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!imageFile) {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(imageFile.filepath);
    const filename = imageFile.originalFilename || 'upload.jpg';

    const blob = await put(filename, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json(blob);
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to upload image.', message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({error: 'No file URL provided'}, {status: 400});
        }
        await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        return NextResponse.json({success: true});
    } catch (error: unknown) {
        console.error('Delete error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to delete image.', message }, { status: 500 });
    }
}
