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

## 📖 Documentación

### `createAuth<TUser>(options)`

Inicializa el sistema de autenticación.

**Parámetros:**

| Nombre              | Tipo                                         | Descripción                                  |
|---------------------|----------------------------------------------|----------------------------------------------|
| `secret`            | `string`                                     | Clave secreta para firmar JWT                |
| `getUserByEmail`    | `(email: string) => Promise<TUser \| null>`  | Devuelve un usuario                          |
| `saveUser`          | `(user: TUser) => Promise<TUser>`            | Guarda un nuevo usuario                      |
| `accessTokenExpiry` | `string`                                     | Expiración del token (ej: `'1h'`)            |
| `refreshTokenExpiry`| `string`                                     | Expiración del token de refresco (ej: `'7d'`)|
| `getUserById`       | `(id: string) => Promise<TUser \| null>`     | Devuelve un usuario por ID               |

**Retorna:** Una instancia de autenticación con métodos para registrar, iniciar sesión y verificar usuarios.
### Métodos de la instancia

```ts
{
  register(input: TUser): Promise<Omit<TUser, 'password'>>;
  login(input: { email: string; password: string }): Promise<{ token: string; expiresIn: string }>;
  verify(token: string): any;
  refresh(token: string): Promise<{ token: string; expiresIn: string }>;
}
```


## 🧪 Ejemplo completo con Express

```ts
import express from 'express';
import { createAuth } from 'authro';


// Tipado del usuario
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
}

// Base de datos simulada (en memoria)
const db: User[] = [];

// Implementación de funciones requeridas por createAuth
const getUserByEmail = async (email: string): Promise<User | null> => {
  return db.find(user => user.email === email) || null;
};

const saveUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const newUser: User = { id: Date.now().toString(), ...userData };
  db.push(newUser);
  return newUser;
};

const getUserById = async (id: string): Promise<User | null> => {
  return db.find(user => user.id === id) || null;
};

// Inicializar autenticación
const auth = createAuth<User>({
  secret: 'super-clave-secreta',
  getUserByEmail,
  saveUser,
  getUserById,
  accessTokenExpiry: '1h', // opcional
  refreshTokenExpiry: '7d' // opcional
});

// Inicializar Express
const app = express();
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Authro'});

});

app.post('/register', async (req, res): Promise<any> => {
  try {

    const result = await auth.register(req.body);
    if (!result.success) return res.status(result.status ?? 400).json(result);
    res.status(201).json(result.user);

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/login', async (req, res): Promise<any> => {
  try {

    const result = await auth.login(req.body);
    if (!result.success) return res.status(result.status ?? 400).json(result);
    res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken, expiresIn: result.expiresIn });

  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/perfil', (req, res, next): any => {
  try {

    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token is required' });
    }

    const token = header.split(' ')[1];
    const payload = auth.verify(token);
    (req as any).user = payload;
    next();

  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}, (req, res) => {
  res.json({ message: 'Protected route', user: (req as any).user });
});



app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

```

## 📚 Más ejemplos

### Registro de usuario

```ts
const newUser = await auth.register({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe',
  role: 'user'
});
```

### Inicio de sesión

```ts
const { token, expiresIn } = await auth.login({
  email: 'user@example.com',
  password: 'securepassword'
});
``` 

### Verificación de token

```ts
const payload = auth.verify(token);
console.log(payload); // { id: 'user-id', email: 'user@example.com' }
```

### Refresco de token

```ts
const { token: newToken, expiresIn } = await auth.refresh(oldToken);
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
