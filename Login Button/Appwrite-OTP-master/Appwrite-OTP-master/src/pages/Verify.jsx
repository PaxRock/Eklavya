import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../lib/appwriteConfig";
import { useSearchParams } from "react-router-dom";

const Verify = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("userId");

    useEffect(() => {
        const getSession = async () => {
            try {
                await account.get();
                navigate("/");
            } catch (error) {
                // Not logged in, stay on page
            }
        };
        getSession();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!userId || !code) {
            setError("Invalid verification details.");
            return;
        }

        try {
            await account.createSession(userId, code);
            navigate("/");
        } catch (error) {
            setError(error.message || "Verification failed");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Verify your phone number</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit">Verify</button>
        </form>
    );
};

export default Verify;
