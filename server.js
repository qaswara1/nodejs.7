const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const usersFilePath = path.join(__dirname, 'users.json');
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

// 2a. GET /api/users - Return all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 2b. GET /api/users/filter?minAge=NUMBER&maxAge=NUMBER
app.get('/api/users/filter', (req, res) => {
  const { minAge, maxAge } = req.query;

  // Check if missing or empty
  if (!minAge || !maxAge || minAge.trim() === '' || maxAge.trim() === '') {
    return res
      .status(400)
      .json({ error: 'minAge and maxAge are required and cannot be empty' });
  }

  const min = Number(minAge);
  const max = Number(maxAge);

  // Check if not a valid number
  if (isNaN(min) || isNaN(max)) {
    return res
      .status(400)
      .json({ error: 'minAge and maxAge must be valid numbers' });
  }

  const filteredUsers = users.filter(
    user => user.age >= min && user.age <= max,
  );

  res.json(filteredUsers);
});

// 2c. GET /api/users/:id - Return user JSON or 400/404
app.get('/api/users/:id', (req, res) => {
  const rawId = req.params.id;

  // Check if empty/spaces or not a valid number
  if (rawId.trim() === '' || isNaN(Number(rawId))) {
    return res.status(400).json({ error: 'User ID must be a valid number' });
  }

  const userId = Number(rawId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// 2d. GET /user/:id - Return HTML page with user details
app.get('/user/:id', (req, res) => {
  const rawId = req.params.id;

  // Check if empty/spaces or not a valid number
  if (rawId.trim() === '' || isNaN(Number(rawId))) {
    return res
      .status(400)
      .send('<h1>400 - User ID must be a valid number</h1>');
  }

  const userId = Number(rawId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).send('<h1>404 - User Not Found</h1>');
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>User Profile - ${user.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 350px; }
        h1 { margin-top: 0; color: #333; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${user.name}</h1>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Age:</strong> ${user.age}</p>
      </div>
    </body>
    </html>
  `;

  res.send(htmlTemplate);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
