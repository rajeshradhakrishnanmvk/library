"use client";

import { useEffect, useState } from "react";
import { getFirebaseMeta } from "@/lib/firebaseMeta";
import { db } from "@/lib/firebase";

export default function FirebaseHealth() {
    const [meta, setMeta] = useState<{ name: string; projectId?: string; authDomain?: string } | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Touch Firestore to ensure SDK is alive
            void db;

            setMeta(getFirebaseMeta());
        } catch (e) {
            setError((e as Error).message);
        }
    }, []);

    if (error) {
        return (
            <div style={{ color: "red" }}>
                Firebase init failed: {error}
            </div>
        );
    }

    if (!meta) {
        return <div>Checking Firebase configuration…</div>;
    }

    return (
        <div style={{ color: "green" }}>
            Firebase connected<br />
            App: {meta.name}<br />
            Project: {meta.projectId}<br />
            authDomain: {meta.authDomain}
        </div>

    );
}
