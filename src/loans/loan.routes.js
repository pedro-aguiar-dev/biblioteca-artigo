import { Router } from "express";

export function createLoanRouter(loanService) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      res.json(await loanService.listLoans());
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      res.status(201).json(await loanService.createLoan(req.body));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
