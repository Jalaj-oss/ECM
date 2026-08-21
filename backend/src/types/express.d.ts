import type { JwtPayload } from "../middleware/authMiddleware.ts";

declare global{
    namespace Express{
        interface request{
            user?:JwtPayload
        }
    }
}
export{}