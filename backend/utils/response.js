export const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const fail = (res, status, message, error = "VALIDATION_ERROR") =>
  res.status(status).json({ success: false, message, error });
