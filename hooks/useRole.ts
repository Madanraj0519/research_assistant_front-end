import { useState, useEffect, useCallback } from "react";
import { AllRoleResponse } from "../apiTypes/types"
import { allRolesApi } from "../services/api/roleApi";

export const useRoles = () => {

    const [roles, setRoles] = useState<AllRoleResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await allRolesApi();
            setRoles(data);
        } catch (err) {
            setError("Failed to fetch roles.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    return {
        roles,
        loading,
        error,
        refetch: fetchRoles,
    };
};