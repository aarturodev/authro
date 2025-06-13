import express, { NextFunction, Request } from 'express';
import { createAuth } from '../src/core/auth'; // importa desde tu build (compilado)
import { access } from 'fs';



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

// Inicializar autenticación
const auth = createAuth<User>({
  secret: 'super-clave-secreta',
  getUserByEmail,
  saveUser,
  getUserById: async (id: string): Promise<User | null> => {
    return db.find(user => user.id === id) || null;
  }
});

// Inicializar Express
const app = express();
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API de Autenticación', version: '1.0.0', db });

});

app.post('/register', async (req, res): Promise<any> => {
  try {
    const result = await auth.register(req.body);
    console.log('Register result:', result);
    if (!result.success) return res.status(result.status ?? 400).json(result);
    res.status(201).json(result.user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/login', async (req, res): Promise<any> => {
  try {
    const result = await auth.login(req.body);
    console.log('Login result:', result);
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
