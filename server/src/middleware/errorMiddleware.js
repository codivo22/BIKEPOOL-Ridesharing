export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  console.error(error);

  res.status(statusCode).json({
    message: error.message || 'Something went wrong. Please try again.'
  });
};
