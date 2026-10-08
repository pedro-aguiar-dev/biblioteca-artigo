export async function runInTransaction(repositories, operation) {
  const snapshots = repositories.map((repository) => repository.snapshot());

  try {
    return await operation();
  } catch (error) {
    repositories.forEach((repository, index) => repository.restore(snapshots[index]));
    throw error;
  }
}
