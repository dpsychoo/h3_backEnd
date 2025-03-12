const request = require("supertest");
const app = require("../server");

describe("🔹 Pruebas de productos", () => {
  
  test("🔹 Obtener todos los productos (debe retornar 200)", async () => {
    const res = await request(app).get("/api/productos");

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  test("🔹 Crear un nuevo producto (como vendedor)", async () => {
    //Obtener un token de un usuario vendedor
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "vendedor@marketfy.com",  //Usuario con rol vendedor
        password: "123456"          
      });

    const token = loginRes.body.token; //guardar token de user autent

    const res = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Producto Test",
        descripcion: "Descripción de prueba",
        precio: 10000,
        stock: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Producto creado exitosamente");
  });

});
