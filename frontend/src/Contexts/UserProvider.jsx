import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApi } from './ApiProvider';
import { useFlash } from './FlashProvider';

const UserContext = createContext();

export default function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState(null);
    const [userPagination, setUserPagination] = useState({ limit: 25, offset: 0, total: 0 });
    const [adminUser, setAdminUser] = useState(false);
    const flash = useFlash();
    const api = useApi();
    const [loadingUser, setLoadingUser] = useState(true);

    const fetchPaginatedUsers = useCallback(
        async (limit = 25, offset = 0) => {
            if (adminUser) {
                const response = await api.get('/users', { limit, offset });
                if (response.ok) {
                    const { data, pagination: pag } = response.body;
                    setAllUsers(data);
                    setUserPagination(pag);
                } else {
                    flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                }
                return response;
            }
        },
        [api, flash, adminUser]
    );

    useEffect(() => {
        (async () => {
            setLoadingUser(true);
            if (api.isAuthenticated()) {
                // if (!user) {
                const response = await api.get('/me');
                if (response.ok) {
                    setUser(response.body);
                    setAdminUser(response.body?.role === 'admin');
                    fetchPaginatedUsers();

                } else {
                    setUser(null);
                    setAdminUser(false);
                }
                // }
            } else {
                setUser(null);
                setAdminUser(false);
            }
            setLoadingUser(false);
        })();
    }, [api, fetchPaginatedUsers, setLoadingUser]);

    const login = useCallback(async (username, password) => {
        const result = await api.login(username, password);
        if (result === 'ok') {
            try {
                const response = await api.get('/me');
                if (response.ok) {
                    setUser(response.body);
                    setAdminUser(response.body?.role === 'admin');
                } else {
                    setUser(null);
                    flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                }
            } catch (error) {
                console.error('Error fetching user data after login:', error);
                setUser(null);
                setAdminUser(false);
            }
        }
        return result;
    }, [api, flash]);

    const logout = useCallback(async () => {
        await api.logout();
        setUser(null);
        setAdminUser(false);
    }, [api, setUser, setAdminUser]);

    const deleteUser = useCallback(
        async (username, user_id) => {
            const choice = window.confirm(`Are you sure you want to delete ${username}`);
            if (choice) {
                const response = await api.delete(`/users/${user_id}`);
                if (response.ok) {
                    flash && flash(`Successfully deleted ${username}`, 'success');
                    fetchPaginatedUsers(userPagination.limit, userPagination.offset);
                } else {
                    flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                }
            }
        },
        [api, fetchPaginatedUsers, userPagination.limit, userPagination.offset, flash]
    );

    const getUser = useCallback(async (username) => {
        const response = await api.get(`/users/${username}`);
        if (response.ok) {
            return response.body?.data;
        } else {
            const errors = response.body?.errors?.json; // Access the errors object
            if (errors) {
                // Combine error messages
                const errorMessage = Object.values(errors)[0]
                    .flat() // Flatten any nested arrays
                    .join(", "); // Combine messages into a single string
                errorMessage.replace('Unauthorized', 'Your session timed out, please login again!')
                flash && flash(errorMessage, 'error');
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
            return response;
        }
    }, [api, flash])

    const createUser = useCallback(async (data) => {
        const response = await api.post("/users", data);
        if (response.ok) {
            flash && flash("User created successfully", 'success')
            return response;
        } else {
            const errors = response.body?.errors?.json; // Access the errors object
            if (errors) {
                // Combine error messages
                const errorMessage = Object.values(errors)[0]
                    .flat() // Flatten any nested arrays
                    .join(", "); // Combine messages into a single string
                errorMessage.replace('Unauthorized', 'Your session timed out, please login again!')
                flash && flash(errorMessage, 'error');
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
            return response;
        }
    }, [api, flash])

    return (
        <UserContext.Provider
            value={{
                user,
                loadingUser,
                getUser,
                adminUser,
                setUser,
                createUser,
                login,
                logout,
                allUsers,
                deleteUser,
                userPagination,
                fetchPaginatedUsers,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
