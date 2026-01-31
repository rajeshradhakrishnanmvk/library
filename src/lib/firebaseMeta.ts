// src/lib/firebaseMeta.ts
import { getApp } from "firebase/app";

export function getFirebaseMeta() {
    const app = getApp();

    return {
        name: app.name,
        projectId: app.options.projectId,
        authDomain: app.options.authDomain,
    };
}
