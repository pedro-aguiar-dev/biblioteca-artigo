export class UserRepository {
  #users = [];
  #nextId = 1;

  async findAll({ page, size }) {
    const start = page * size;
    return this.#users.slice(start, start + size);
  }

  async findById(id) {
    return this.#users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email) {
    return this.#users.find((user) => user.email === email) ?? null;
  }

  async save(user) {
    if (user.id === undefined) {
      const createdUser = { ...user, id: this.#nextId++ };
      this.#users.push(createdUser);
      return createdUser;
    }

    const index = this.#users.findIndex((storedUser) => storedUser.id === user.id);

    if (index === -1) {
      this.#users.push(user);
    } else {
      this.#users[index] = user;
    }

    return user;
  }
}
