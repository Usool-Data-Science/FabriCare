import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useApi } from "./ApiProvider";
import { useFlash } from "./FlashProvider";
import { useUser } from "./UserProvider";

const ArtistContext = createContext();

const ArtistProvider = ({ children }) => {
    const [artists, setArtists] = useState(null);
    const [artistNames, setArtistNames] = useState([]);
    const [artistsPagination, setArtistsPagination] = useState({ limit: 25, offset: 0, total: 0 });
    const api = useApi();
    const { adminUser } = useUser();
    const flash = useFlash();


    const fetchPaginatedArtists = useCallback(
        async (limit = 25, offset = 0) => {
            if (adminUser) {
                try {
                    const response = await api.get('/artists', { limit, offset });
                    if (response.ok) {
                        const { data, pagination: pag } = response.body;
                        setArtists(data);
                        setArtistsPagination(pag);
                        return response;
                    } else {
                        flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                        return null;
                    }
                } catch (error) {
                    console.error('Error fetching artists:', error);
                    flash && flash('An error occurred while fetching artists.', 'error');
                    return null;
                }
            }
        },
        [api, flash, adminUser]
    );

    // Fetch all artist names
    const fetchArtistNames = useCallback(async () => {
        if (api.isAuthenticated() && adminUser) {
            const response = await api.get('/artist-names');
            if (response.ok) {
                setArtistNames(response?.body?.artists);
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, adminUser])

    useEffect(() => {
        fetchPaginatedArtists();
        fetchArtistNames();
    }, [fetchPaginatedArtists, fetchArtistNames]);


    const updateArtist = useCallback(async (url, body) => {
        try {
            const response = await api.put(url, body, { type: 'form' });
            if (response.ok) {
                flash && flash(`${body.title} updated successfully`, 'success');
                return response;
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
                return null;
            }
        } catch (error) {
            console.error(`Error updating artist information`, error);
            flash && flash(`An error occurred while updating the artist information`, 'error')
        }
    }, [api, flash])

    const createArtist = useCallback(async (url, body) => {
        const response = await api.post(url, body, { type: 'form' });
        if (response.ok) {
            flash && flash("Artist created successfully", 'success')
            return response;
        } else {
            const errors = response.body?.errors?.json || response.body?.errors?.form;
            if (errors) {
                const errorMessage = Object.values(errors)[0]
                    .flat()
                    .join(", ");
                errorMessage.replace('Unauthorized', 'Your session timed out, please login again!')
                flash && flash(errorMessage, 'error');
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
            return response;
        }
    }, [api, flash])

    // Delete Artists
    const deleteArtist = useCallback(async (artistId) => {
        const choice = window.confirm(`Are you sure you want to delete artist ${artistId}?`);
        if (choice) {
            const response = await api.delete(`/artists/${artistId}`);
            if (response.ok) {
                flash && flash(`Successfully deleted order ${artistId}`, 'success');
                fetchPaginatedArtists(artistsPagination.limit, artistsPagination.offset); // Re-fetch carts
            } else {
                flash && flash(response.body?.message || "An unexpected error occurred", 'error');
            }
        }
    }, [api, flash, fetchPaginatedArtists, artistsPagination.limit, artistsPagination.offset]);

    return (
        <ArtistContext.Provider value={{
            artists, artistsPagination,
            deleteArtist, artistNames,
            createArtist, updateArtist,
            fetchArtistNames, fetchPaginatedArtists,
        }}>
            {children}
        </ArtistContext.Provider>
    )
}

export default ArtistProvider

export function useArtist() {
    return useContext(ArtistContext);
}