// Простая схема пользователя для MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Модель для пользователей
const User = mongoose.model("User", userSchema);

// Добавление нового пользователя
app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Error creating user", message: err.message });
  }
});

// Получение всех пользователей
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching users", message: err.message });
  }
});
