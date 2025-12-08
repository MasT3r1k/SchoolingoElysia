import { Elysia } from "elysia";
import { changelog } from "../../../data/changelog.data";

export default new Elysia({ prefix: '/changelog' })
    .get('/', () => {
        return changelog;
    });
