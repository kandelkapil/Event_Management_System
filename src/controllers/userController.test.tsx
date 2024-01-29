import { Request, Response } from 'express';
import { usersList } from './userController';
import { db } from '../models/index';

jest.mock('../models/index', () => ({
  db: {
    user: {
      findAll: jest.fn(),
    },
  },
}));

describe('usersList', () => {
  it('should return a list of users with status 200', async () => {
    const req = {} as Request | any;
    const res = {
      status: jest.fn(() => res), // Use a spy to allow chaining
      send: jest.fn(),
    } as unknown as Response;

    const mockUsers = [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
      },
      {
        id: 2,
        first_name: 'Jane',
        last_name: 'Doe',
      },
    ];

    (db.user.findAll as jest.Mock).mockResolvedValueOnce(mockUsers);

    await usersList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((res.status as jest.Mock).mock.calls[0][0]).toBe(200); // Check the first call's argument

    expect(res.send).toHaveBeenCalledWith({
      count: mockUsers.length,
      users: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
        }),
        expect.objectContaining({
          id: 2,
          first_name: 'Jane',
          last_name: 'Doe',
        }),
      ]),
    });
  });
});
