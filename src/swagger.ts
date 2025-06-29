import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat API",
      version: "1.0.0",
      description: "API documentation for Chat app (Owners, Tenants, Messages)",
    },
  },
  apis: ["src/routes.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
