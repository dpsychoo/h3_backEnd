const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authController = {
  // R. User
  async register(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      const userExists = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "El usuario ya está registrado" });
      }

      // Encriptar la contraseña antes de guardarla en la BD
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { rows } = await pool.query(
        "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
        [nombre, email, hashedPassword, rol]
      );

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: rows[0],
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  },

  // I.S.
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Verif si user existe en la BD
      const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const user = rows[0];

      // Comparar la contraseña ingresada con la contraseña hasheada
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      // Generar el token JWT
      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Inicio de sesión exitoso", token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  },

  // Get Pf user autenticado
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const { rows } = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = $1", [userId]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
  }
};

module.exports = authController;
