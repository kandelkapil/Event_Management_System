import { Request, Response } from 'express';
import { imageUpload } from './utilsController';

describe('imageUpload function', () => {
  it('should return success response when a file is provided', async () => {
    const req: Request = {
      file: {
        originalname: 'test-image.jpg',
      } as Express.Multer.File,
    } as Request;

    const res: Response = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as any;

    await imageUpload(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      filename: 'test-image.jpg',
      path: '/upload/image/test-image.jpg',
      message: 'Image upload success',
    });
  });
});
