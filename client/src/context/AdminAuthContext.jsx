import { useState, useEffect, createContext } from "react";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const adminInfoString = localStorage.getItem("adminData");

        if (token && adminInfoString) {
            const adminInfo = JSON.parse(adminInfoString);
            setAdmin({ token, ...adminInfo });
        }

        setLoading(false);
    }, []);

    const login = (token, adminInfo) => {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminData", JSON.stringify(adminInfo));
        setAdmin({ token, ...adminInfo });
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
