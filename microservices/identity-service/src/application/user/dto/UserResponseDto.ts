export class UserResponseDto {
    id!: string;
    name!: string;
    email!: string;
    createdAt!: string;
  
    static sample(): UserResponseDto {
      return {
        id: 'abc-123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
      };
    }
  }