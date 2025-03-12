const request = require("supertest");
const app = require("../server");

describe("🔹 Pruebas de autenticación", () => {
  
  test("🔹 Registrar un usuario exitosamente", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Test User",
        email: `test${Date.now()}@marketfy.com`, //Generar email único
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email");
  });

  test("🔹 Login exitoso", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "eminem@slimshady.com",  //user de la bd
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("🔹 Login con credenciales incorrectas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "incorrecto@marketfy.com", //Usuario que no existe
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Credenciales inválidas");
  });

});
