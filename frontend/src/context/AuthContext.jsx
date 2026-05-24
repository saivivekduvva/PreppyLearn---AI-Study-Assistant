import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let requestInterceptor;
        let responseInterceptor;
        if (token) {
            // Setup interceptor to attach token
            requestInterceptor = apiClient.interceptors.request.use(config => {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            });

            // Setup interceptor to handle 401 Unauthorized
            responseInterceptor = apiClient.interceptors.response.use(
                response => response,
                error => {
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            );

            setUser({ loggedIn: true }); // simplified
        } else {
            setUser(null);
        }
        
        setIsLoading(false);

        return () => {
            if (requestInterceptor) apiClient.interceptors.request.eject(requestInterceptor);
            if (responseInterceptor) apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [token]);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        try {
            const response = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const { access_token } = response.data;
            setToken(access_token);
            localStorage.setItem('token', access_token);
            setUser({ username });
            return true;
        } catch (error) {
            console.error("Login error", error);
            throw error;
        }
    };

    const register = async (username, password) => {
        try {
            await apiClient.post('/auth/register', { username, password });
            return await login(username, password);
        } catch (error) {
            console.error("Register error", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
