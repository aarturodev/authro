**Authro** es una librería de autenticación minimalista y versátil para Node.js, escrita en TypeScript. Está diseñada para desacoplar completamente la lógica de autenticación del framework HTTP que uses (como Express, Fastify o Koa), permitiendo una integración segura, limpia y reutilizable.

---

## ✨ Características

- 🔐 Autenticación basada en **JWT**
- 🔒 Hash y comparación de contraseñas con **bcryptjs**
- 🔄 Compatible con cualquier base de datos (SQL/NoSQL)
- 🧩 Agnóstica al framework: Express, Fastify, Hapi, etc.
- ✅ Tipado completo con TypeScript genérico

---

## 📦 Instalación

```bash
npm install authro
```

## 🧠 Buenas prácticas

- Usa variables de entorno para manejar tu `JWT_SECRET`.
- No devuelvas el campo `password` en respuestas.
- Usa HTTPS en producción.
- Usa middlewares para proteger rutas de forma más limpia.

---

## 🚀 Uso rápido

```ts
import { createAuth } from 'authro';

const auth = createAuth({
  secret: process.env.JWT_SECRET!,
  getUserByEmail: async (email) => { /* ... */ },
  getUserById: async (id) => { /* ... */ },
  saveUser: async (user) => { /* ... */ }

});

const token = await auth.login({ email, password });
const newUser = await auth.register({ email, password, name });
const payload = auth.verify(token);
```

## ⚙️ API

### `createAuth<TUser>(options)`

Inicializa el sistema de autenticación.

**Parámetros:**

| Nombre           | Tipo                                         | Descripción                              |
|------------------|----------------------------------------------|------------------------------------------|
| `secret`         | `string`                                     | Clave secreta para firmar JWT            |
| `getUserByEmail` | `(email: string) => Promise<TUser \| null>`  | Devuelve un usuario                      |
| `saveUser`       | `(user: TUser) => Promise<TUser>`            | Guarda un nuevo usuario                  |
| `tokenExpiry`    | `string`                                     | Expiración del token (ej: `'1h'`)        |
| `getUserById`    | `(id: string) => Promise<TUser \| null>`     | Devuelve un usuario por ID               |

**Métodos retornados:**


```ts
{
  register(input: TUser): Promise<Omit<TUser, 'password'>>;
  login(input: { email: string; password: string }): Promise<{ token: string; expiresIn: string }>;
  verify(token: string): any;
  refresh()
}
```


## 🧪 Ejemplo completo con Express

```ts
import express from 'express';
import { createAuth } from 'authro';

const app = express();
app.use(express.json());

const auth = createAuth({ secret, getUserByEmail, saveUser, getUserById });

app.post('/register', async (req, res) => {
  try {
    const user = await auth.register(req.body);
    res.status(201).json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const token = await auth.login(req.body);
    res.json(token);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

app.get('/perfil', (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    req.user = auth.verify(token!);
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido' });
  }
}, (req, res) => {
  res.json({ message: 'Ruta protegida', user: req.user });
});
```


## 👤 Tipos personalizados

Puedes extender el tipo de usuario base como prefieras:


```ts
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
}
```

## 🧩 Requisitos

- Node.js >= 16
- TypeScript >= 5
- bcryptjs
- jsonwebtoken



## 🤝 Contribuir

¿Ideas para mejorar esta librería?

1. Haz un fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios y commitea
4. Haz push a tu rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

¡Gracias por contribuir!


## 📝 Licencia

MIT © Anderson Marin

## 📫 Contacto

Puedes encontrarme en:
- [GitHub](https://github.com/aarturodev)
- [LinkedIn](https://linkedin.com/in/aarturodev)
