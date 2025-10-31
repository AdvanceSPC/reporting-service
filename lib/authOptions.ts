import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                const [rows] : any = await db.execute(
                    "SELECT * FROM users WHERE username = ? LIMIT 1",
                    [credentials?.username]
                );
                const user = rows[0];
                if (!user) return null;

                const isValid = await bcrypt.compare(credentials!.password, user.password);
                if (!isValid) return null;

                return {id: user.id, username: user.username};
            },
        }),
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
}