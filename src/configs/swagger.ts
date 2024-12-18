import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerSpecs = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "English-GO API",
            version: "1.0.0",
            description:
                "English-GO API is a RESTful API that provides endpoints for control English-GO services",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
        },
        servers: [
            {
                url: `${process.env.BASE_URL}:${process.env.APP_PORT}/`,
            },
        ],
    },
    apis: ["./src/controllers/**/*.*s", "./src/models/**/*.*s",],
};

const options = {
    customSiteTitle: "English-GO API",
};

const specs = swaggerJSDoc(swaggerSpecs);
export { options, specs };

