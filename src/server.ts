import app from './app';

const PORT = process.env.PORT || 3000;

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`HR server started on port ${PORT}`));
