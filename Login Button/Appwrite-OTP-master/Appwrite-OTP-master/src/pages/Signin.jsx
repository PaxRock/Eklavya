import React, { useState } from "react";
import { account } from "../lib/appwriteConfig";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";

const Signin = () => {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const token = await account.createPhoneToken(ID.unique(), phone);
            navigate(`/verify?userId=${token.userId}`);
        } catch (error) {
            setError(error.message || "Failed to send verification code");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Signin with your phone number</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <button type="submit">Send verification code</button>
        </form>
    );
};

export default Signin;
