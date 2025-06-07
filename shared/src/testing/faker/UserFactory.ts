import { faker, type Faker } from '@faker-js/faker';

export class UserFactory {

  static get faker(): Faker {
    return faker;
  }

  static withAllFields() {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      avatarUrl: faker.image.avatar(),
      phoneNumber: faker.phone.number(),
      birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      bio: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }
  static wajdi() {
    return {
      name: 'Wajdi',
      email: 'wajdihh@yopmail.com',
      password: 'blablabla',
      avatarUrl: faker.image.avatar(),
      phoneNumber: faker.phone.number(),
      birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      bio: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }
}
