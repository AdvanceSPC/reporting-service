'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            username, password, redirect: true, callbackUrl: "/"
        });
        if (res?.error) setError("Usuario o contraseña incorrectos");
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-xl w-80">
                <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>
                <input type="text" placeholder="Usuario"
                    className="border w-full p-2 mb-3 rounded" value={username}
                    onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Contraseña"
                    className="border w-full p-2 mb-3 rounded" value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                    Entrar
                </button>
            </form>
        </div>
    )
}