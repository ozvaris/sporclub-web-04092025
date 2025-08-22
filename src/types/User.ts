// src/types/User.ts

export interface IUser {
  id: number;
  name: string;
  email: string;
}

export class User implements IUser {
  constructor(
    public id: number,
    public name: string,
    public email: string,
  ) {}

  /** Parse plain JSON to class */
  static fromJson(j: unknown): User {
    const o = j as IUser;
    return new User(o.id, o.name, o.email);
  }

  get displayName() {
    return this.name;
  }
}

