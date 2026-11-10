import { Router } from "express";

import { validate } from "../middlewares/validate.middleware.js";

/** list / get / create / update / delete for a controller built by `crud()`. */
export function resourceRouter(controller, { create, update }) {
  const router = Router();

  router.route("/").get(controller.list).post(validate(create), controller.create);
  router
    .route("/:id")
    .get(controller.get)
    .patch(validate(update), controller.update)
    .put(validate(update), controller.update)
    .delete(controller.remove);

  return router;
}
