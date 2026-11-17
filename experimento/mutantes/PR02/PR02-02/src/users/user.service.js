import { AppError } from "../shared/app-error.js";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createUser(input) {
    const { name, email } = input;

    if (isBlank(name) || !isValidEmail(email)) {
      throw new AppError("INVALID_USER");
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser && existingUser.id === input.id) {
      throw new AppError("EMAIL_ALREADY_EXISTS", 409);
    }

    return this.userRepository.save({ name, email });
  }

  async updateEmail(id, input) {
    const { email } = input;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("USER_NOT_FOUND", 404);
    }

    if (!isValidEmail(email)) {
      throw new AppError("INVALID_EMAIL");
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser && existingUser.id !== user.id) {
      throw new AppError("EMAIL_ALREADY_EXISTS", 409);
    }

    user.email = email;
    return this.userRepository.save(user);
  }

  async listUsers({ page = 0, size = DEFAULT_PAGE_SIZE } = {}) {
    if (!Number.isInteger(page) || page < 0) {
      throw new AppError("INVALID_PAGINATION");
    }

    if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
      throw new AppError("INVALID_PAGINATION");
    }

    return this.userRepository.findAll({ page, size });
  }
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
