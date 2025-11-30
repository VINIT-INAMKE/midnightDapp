export const API_BASE_URL: string = `https://web3lms-rnma.onrender.com/api/v1/`;
// export const API_BASE_URL: string = `http://127.0.0.1:8000/api/v1/`;
export const MINT_API_BASE_URL: string = `https://vinitmint.vercel.app/`;
export const PAYPAL_CLIENT_ID: string = "test";

// Helper functions to get user data dynamically (not at module level)
// This prevents SSR hydration errors
export const getUserId = (): number | undefined => {
    if (typeof window === "undefined") return undefined;
    const UserData = require("@/views/plugins/UserData").default;
    return UserData()?.user_id;
};

export const getTeacherId = (): number | undefined => {
    if (typeof window === "undefined") return undefined;
    const UserData = require("@/views/plugins/UserData").default;
    return UserData()?.teacher_id;
};

// Deprecated: Use getUserId() and getTeacherId() instead
export const userId: number | undefined = undefined;
export const teacherId: number | undefined = undefined;
