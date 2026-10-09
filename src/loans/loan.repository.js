export class LoanRepository {
  #loans = [];
  #nextId = 1;

  async findAll() {
    return [...this.#loans];
  }

  async findById(id) {
    return this.#loans.find((loan) => loan.id === id) ?? null;
  }

  async findByUser(userId) {
    return this.#loans.filter((loan) => loan.userId === userId);
  }

  async findOpenByUser(userId) {
    return this.#loans.filter(
      (loan) => loan.userId === userId && loan.returnDate === null
    );
  }

  async findByUserAndBook(userId, bookId) {
    return (
      this.#loans.find(
        (loan) => loan.userId === userId && loan.bookId === bookId
      ) ?? null
    );
  }

  async findOpenByUserAndBook(userId, bookId) {
    return (
      this.#loans.find(
        (loan) =>
          loan.userId === userId &&
          loan.bookId === bookId &&
          loan.returnDate === null
      ) ?? null
    );
  }

  async save(loan) {
    if (loan.id === undefined) {
      const createdLoan = { ...loan, id: this.#nextId++ };
      this.#loans.push(createdLoan);
      return createdLoan;
    }

    const index = this.#loans.findIndex((storedLoan) => storedLoan.id === loan.id);

    if (index === -1) {
      this.#loans.push(loan);
    } else {
      this.#loans[index] = loan;
    }

    return loan;
  }

  snapshot() {
    return { loans: structuredClone(this.#loans), nextId: this.#nextId };
  }

  restore(snapshot) {
    this.#loans = snapshot.loans;
    this.#nextId = snapshot.nextId;
  }
}
