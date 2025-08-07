import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.json({ user: "Gia Huy (from TypeScript)" });
});

export default router;