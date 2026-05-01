const { HttpError } = require("../utils/http-error");

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));

      return next(new HttpError(422, "Validation failed", "VALIDATION_ERROR", details));
    }

    req.validatedBody = parsed.data;
    return next();
  };
}

module.exports = {
  validateBody,
};
