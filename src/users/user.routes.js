import { Router } from "express";

export function createUserRouter(userService) {
  const router = Router();

  router.post("/", async (req, res) => {
    const user = await userService.createUser(req.body ?? {});
    res.status(201).json(user);
  });

  router.get("/", async (req, res) => {
    const users = await userService.listUsers({
      page: toNumber(req.query.page),
      size: toNumber(req.query.size),
    });
    res.json(users);
  });

  router.patch("/:id/email", async (req, res) => {
    const user = await userService.updateEmail(Number(req.params.id), req.body ?? {});
    res.json(user);
  });

  return router;
}

function toNumber(value) {
  return value === undefined ? undefined : Number(value);
}
