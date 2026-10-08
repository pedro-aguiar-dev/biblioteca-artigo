export class BookRepository {
  #books = [];
  #nextId = 1;

  async findAll() {
    return [...this.#books];
  }

  async findOne(criteria) {
    const conditions = Object.entries(criteria);

    return (
      this.#books.find((book) =>
        conditions.every(([field, value]) => book[field] === value)
      ) ?? null
    );
  }

  async searchByTitleOrAuthor(term) {
    return this.#books.filter(
      (book) => matchesTerm(book.title, term) || matchesTerm(book.author, term)
    );
  }

  async save(book) {
    if (book.id === undefined) {
      const createdBook = { ...book, id: this.#nextId++ };
      this.#books.push(createdBook);
      return createdBook;
    }

    const index = this.#books.findIndex((storedBook) => storedBook.id === book.id);

    if (index === -1) {
      this.#books.push(book);
    } else {
      this.#books[index] = book;
    }

    return book;
  }

  snapshot() {
    return { books: structuredClone(this.#books), nextId: this.#nextId };
  }

  restore(snapshot) {
    this.#books = snapshot.books;
    this.#nextId = snapshot.nextId;
  }
}

function matchesTerm(text, term) {
  const query = term.toLowerCase();
  return text.toLowerCase().includes(query);
}
