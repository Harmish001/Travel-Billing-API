---
trigger: always_on
alwaysApply: true
---

# 🚀 Node.js + TypeScript Coding Rules (Qoder Prompt)

# General Instructions

- Always Follow best prcatice for Node js project with TypeScript
- Always assign types/interface/enums Avoid using any.
- Do not include any extra comments in the code because it make code less readable
- Make sure you Follow Model, Routes and Controller Pattern.
- Use mongoose query wherever possible avoid using loops and for complex data
- Avoid Using Classes use Functions everywhere
- Follow the pattern in every response in API
  ` {"status": true/false, "message": "Success / Custom message / Error Message", "data": API_RESPONSE}`

---

## 📌 General Rules

- ✅ Use **TypeScript everywhere** — no `any`.
- ✅ Follow **MVC pattern**:

  - **Models** → Mongoose schemas & queries
  - **Controllers** → Business logic & validation
  - **Views** → API responses (JSON formatting)

- ✅ Avoid `class` syntax → use **functions + modules**.
- ✅ Always **import with ES Modules** (`import … from …`).
- ✅ Use **async/await**, never mix `.then()` with async.
- **Do not use** Classes in controller create functions everywhere
- **Do not add** extra comments in the code because it make code less readable.

---

## 🗄️ Mongoose Query Rules

- Always define **typed models** with interfaces.
- Use standard queries: `.find()`, `.findOne()`, `.aggregate()`, `.updateOne()`.
- Example filter query:

  ```ts
  const users = await User.find({ age: { $gte: 18 }, isActive: true });
  ```

- Never expose raw `_id` → map it to `id`.

---

## 🛠 Best Practices

1. Create a `types/` folder for all shared **types & interfaces**.
2. Add a centralized **error handler middleware**.
3. Use **dotenv** for configs → never hardcode secrets.
4. Validate inputs (`body`, `params`, `query`) before controllers using **zod** or **joi**.
5. Use `index.ts` for exports in each folder for clean imports.
6. Keep functions **pure** → avoid side effects in controllers.
7. Naming conventions:

   - **Models** → `PascalCase` (e.g., `UserModel`)
   - **Functions** → `camelCase` (e.g., `getUserById`)
   - **Constants** → `UPPER_CASE` (e.g., `JWT_SECRET`)

---

## 📂 Project Structure

```
src/
 ┣ models/
 ┃ ┗ user.model.ts
 ┣ controllers/
 ┃ ┗ user.controller.ts
 ┣ routes/
 ┃ ┗ user.routes.ts
 ┣ types/
 ┃ ┗ user.types.ts
 ┣ utils/
 ┃ ┗ errorHandler.ts
 ┣ app.ts
 ┗ server.ts
```

---

## ✅ Summary

- **TypeScript only**
- **MVC pattern enforced**
- **Functions > Classes**
- **Mongoose for DB queries**
- **Node.js best practices applied**

---
