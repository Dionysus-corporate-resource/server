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


// Найти один документ по ID
const doc = await Model.findById(id);

// Найти по ID и обновить
const updated = await Model.findByIdAndUpdate(
  id,
  { $set: { field: 'new value' }},
  { new: true } // вернуть обновленный документ
);

// Найти по ID и удалить
const deleted = await Model.findByIdAndDelete(id);

// Допустим есть модель компании с массивом сотрудников
const CompanySchema = new Schema({
  name: String,
  employees: [{
    name: String,
    position: String
  }]
});

// Найти и обновить вложенный объект
const company = await Company.findOneAndUpdate(
  { 'employees._id': employeeId }, // поиск по ID вложенного документа
  {
    $set: {
      'employees.$.name': 'New Name'
    }
  },
  { new: true }
);

// Удалить вложенный объект
const result = await Company.findByIdAndUpdate(
  companyId,
  {
    $pull: {
      employees: { _id: employeeId }
    }
  },
  { new: true }
);
